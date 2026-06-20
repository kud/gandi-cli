import type {
  Domain,
  DnsRecord,
  GandiError,
  TokenInfo,
} from "../types/gandi.js"
import { authError } from "./errors.js"

const BASE_URL = "https://api.gandi.net/v5"

const authHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
})

const request = async <T>(
  apiKey: string,
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(apiKey), ...options.headers },
  })

  if (!res.ok) {
    const err = (await res
      .json()
      .catch(() => ({ message: res.statusText }))) as GandiError
    const message = err.message ?? `HTTP ${res.status}`
    if (res.status === 401 || res.status === 403)
      throw authError("unauthorized", message)
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const listDomains = (apiKey: string): Promise<Domain[]> =>
  request<Domain[]>(apiKey, "/domain/domains")

export const renewDomain = (
  apiKey: string,
  domain: string,
  duration: number,
): Promise<void> =>
  request<void>(apiKey, `/domain/domains/${domain}/renew`, {
    method: "POST",
    body: JSON.stringify({ duration }),
  })

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
  if (!res.ok) {
    const err = (await res
      .json()
      .catch(() => ({ message: res.statusText }))) as GandiError
    const message = err.message ?? `HTTP ${res.status}`
    if (res.status === 401 || res.status === 403)
      throw authError("unauthorized", message)
    throw new Error(message)
  }
  return res.json() as Promise<TokenInfo>
}
