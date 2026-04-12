import type { Domain, DnsRecord, GandiError } from "../types/gandi.js"

const BASE_URL = "https://api.gandi.net/v5"

const request = async <T>(
  apiKey: string,
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Apikey ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = (await res
      .json()
      .catch(() => ({ message: res.statusText }))) as GandiError
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const listDomains = (apiKey: string): Promise<Domain[]> =>
  request<Domain[]>(apiKey, "/domain/domains")

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
