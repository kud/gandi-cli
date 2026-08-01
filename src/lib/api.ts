import type {
  Domain,
  DomainCheck,
  DnsRecord,
  GandiError,
  RedirectPatch,
  TokenInfo,
  WebRedir,
} from "../types/gandi.js"
import { authError } from "./errors.js"

const BASE_URL = "https://api.gandi.net/v5"

const authHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
})

const toError = async (res: Response): Promise<Error> => {
  const err = (await res
    .json()
    .catch(() => ({ message: res.statusText }))) as GandiError
  const message = err.message ?? `HTTP ${res.status}`
  return res.status === 401 || res.status === 403
    ? authError("unauthorized", message)
    : new Error(message)
}

const request = async <T>(
  apiKey: string,
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(apiKey), ...options.headers },
  })

  if (!res.ok) throw await toError(res)

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const listDomains = (apiKey: string): Promise<Domain[]> =>
  request<Domain[]>(apiKey, "/domain/domains")

export const getDomain = (apiKey: string, domain: string): Promise<Domain> =>
  request<Domain>(apiKey, `/domain/domains/${domain}`)

export const checkDomain = (
  apiKey: string,
  name: string,
): Promise<DomainCheck> =>
  request<DomainCheck>(
    apiKey,
    `/domain/check?name=${encodeURIComponent(name)}&processes=create`,
  )

export const renewDomain = (
  apiKey: string,
  domain: string,
  duration: number,
): Promise<void> =>
  request<void>(apiKey, `/domain/domains/${domain}/renew`, {
    method: "POST",
    body: JSON.stringify({ duration }),
  })

export const setAutorenew = (
  apiKey: string,
  domain: string,
  enabled: boolean,
): Promise<void> =>
  request<void>(apiKey, `/domain/domains/${domain}/autorenew`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  })

// Gandi paginates web redirects and caps an unqualified request at 50, so a
// domain with more than that lost the tail with no error and no warning —
// `redirect list` reported 50 of 64 as though that were all of them, and the
// missing ones were invisible to any script reading the JSON. Page through
// until a short page comes back rather than trusting a single response.
const REDIRECTS_PER_PAGE = 100
const REDIRECTS_PAGE_LIMIT = 100

export const listRedirects = async (
  apiKey: string,
  domain: string,
): Promise<WebRedir[]> => {
  const all: WebRedir[] = []

  for (let page = 1; page <= REDIRECTS_PAGE_LIMIT; page++) {
    const batch = await request<WebRedir[]>(
      apiKey,
      `/domain/domains/${domain}/webredirs?page=${page}&per_page=${REDIRECTS_PER_PAGE}`,
    )
    all.push(...batch)
    if (batch.length < REDIRECTS_PER_PAGE) return all
  }

  // Refuse to return a silently truncated list: the whole point of this
  // function is that a short answer is indistinguishable from a complete one.
  throw new Error(
    `Stopped after ${REDIRECTS_PAGE_LIMIT} pages of web redirects for ${domain} — the list may be incomplete`,
  )
}

// Gandi identifies a web redirect by its fully-qualified source host, in the
// list response, in the {host} path segment and in the POST body alike — the
// bare label 400s. Earlier versions assumed the label everywhere, which made
// `redirect list` print `www.example.com.example.com` and sent `delete` to a
// path the API rejects. Both spellings are accepted here and normalised to the
// FQDN, so the fix does not break anyone's existing scripts.
export const toRedirectHost = (domain: string, host: string): string =>
  !host || host === "@"
    ? domain
    : host === domain || host.endsWith(`.${domain}`)
      ? host
      : `${host}.${domain}`

export const addRedirect = (
  apiKey: string,
  domain: string,
  host: string,
  url: string,
  type: string,
): Promise<void> =>
  request<void>(apiKey, `/domain/domains/${domain}/webredirs`, {
    method: "POST",
    body: JSON.stringify({ host: toRedirectHost(domain, host), url, type }),
  })

export const updateRedirect = (
  apiKey: string,
  domain: string,
  host: string,
  patch: RedirectPatch,
): Promise<void> =>
  request<void>(
    apiKey,
    `/domain/domains/${domain}/webredirs/${toRedirectHost(domain, host)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  )

export const deleteRedirect = (
  apiKey: string,
  domain: string,
  host: string,
): Promise<void> =>
  request<void>(
    apiKey,
    `/domain/domains/${domain}/webredirs/${toRedirectHost(domain, host)}`,
    { method: "DELETE" },
  )

export const listDnsRecords = (
  apiKey: string,
  domain: string,
): Promise<DnsRecord[]> =>
  request<DnsRecord[]>(apiKey, `/livedns/domains/${domain}/records`)

export const setDnsRecord = (
  apiKey: string,
  domain: string,
  type: string,
  name: string,
  values: string[],
  ttl = 10800,
): Promise<void> =>
  request<void>(apiKey, `/livedns/domains/${domain}/records/${name}/${type}`, {
    method: "PUT",
    body: JSON.stringify({ rrset_ttl: ttl, rrset_values: values }),
  })

// Returns the whole zone as a BIND-format master file (RFC 1035), via the
// LiveDNS records route with an Accept: text/plain header.
export const exportZone = async (
  apiKey: string,
  domain: string,
): Promise<string> => {
  const res = await fetch(`${BASE_URL}/livedns/domains/${domain}/records`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "text/plain" },
  })
  if (!res.ok) throw await toError(res)
  return res.text()
}

export const getDnsRecord = async (
  apiKey: string,
  domain: string,
  type: string,
  name: string,
): Promise<DnsRecord | null> => {
  const res = await fetch(
    `${BASE_URL}/livedns/domains/${domain}/records/${name}/${type}`,
    { headers: authHeaders(apiKey) },
  )
  if (res.status === 404) return null
  if (!res.ok) throw await toError(res)
  return res.json() as Promise<DnsRecord>
}

// Appends a value to an existing rrset rather than replacing it (which is what
// setDnsRecord's PUT does). Reads the current values, unions the new one, and
// writes the set back — preserving the existing TTL unless one is given.
export const addDnsValue = async (
  apiKey: string,
  domain: string,
  type: string,
  name: string,
  value: string,
  ttl?: number,
): Promise<{ added: boolean; values: string[] }> => {
  const existing = await getDnsRecord(apiKey, domain, type, name)
  const current = existing?.rrset_values ?? []
  if (current.includes(value)) return { added: false, values: current }

  const values = [...current, value]
  await setDnsRecord(
    apiKey,
    domain,
    type,
    name,
    values,
    ttl ?? existing?.rrset_ttl,
  )
  return { added: true, values }
}

export const deleteDnsRecord = (
  apiKey: string,
  domain: string,
  type: string,
  name: string,
): Promise<void> =>
  request<void>(apiKey, `/livedns/domains/${domain}/records/${name}/${type}`, {
    method: "DELETE",
  })

// Introspects the token itself (name, expiry, scopes). Unlike the v5
// organization endpoints, it needs no extra scope, so it works for a
// least-privilege token. Hosted on id.gandi.net, not api.gandi.net.
export const getTokenInfo = async (apiKey: string): Promise<TokenInfo> => {
  const res = await fetch("https://id.gandi.net/tokeninfo", {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw await toError(res)
  return res.json() as Promise<TokenInfo>
}
