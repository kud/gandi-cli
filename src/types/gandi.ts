export interface Domain {
  fqdn: string
  fqdn_unicode: string
  href: string
  id: string
  name_server?: {
    current: string
  }
  nameservers?: string[]
  autorenew?: {
    enabled: boolean
    duration?: number
  }
  services?: string[]
  dates: {
    created_at: string
    registry_created_at: string
    registry_ends_at: string
    updated_at: string
  }
  status: string[]
  tld: string
}

export interface DomainCheck {
  currency?: string
  products: {
    name: string
    status: string
    process?: string
    prices?: {
      min_duration?: number
      max_duration?: number
      duration_unit?: string
      price_before_taxes?: number
      price_after_taxes?: number
    }[]
  }[]
}

export interface WebRedir {
  host: string
  type: string
  url?: string
  protocol?: string
  override?: boolean
}

export interface DnsRecord {
  rrset_name: string
  rrset_type: string
  rrset_ttl: number
  rrset_href: string
  rrset_values: string[]
}

export interface GandiError {
  code: number
  message: string
  object: string
  cause: string
}

export interface TokenInfo {
  pat_name: string
  scope: string[]
  entities: { id: string }[]
  expires_in: number
}
