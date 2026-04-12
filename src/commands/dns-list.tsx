import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { listDnsRecords } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { DnsRecord } from "../types/gandi.js"
import Table from "../components/table.js"
import SpinnerAction from "../components/spinner-action.js"
import ErrorMessage from "../components/error.js"

interface DnsListProps {
  domain: string
}

const DnsList = ({ domain }: DnsListProps) => {
  const [records, setRecords] = useState<DnsRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        const data = await listDnsRecords(key, domain)
        setRecords(data)
      } catch (e) {
        setError((e as Error).message)
      }
    }
    run()
  }, [])

  if (error) return <ErrorMessage message={error} />
  if (!records)
    return <SpinnerAction label={`Fetching DNS records for ${domain}…`} />

  if (records.length === 0) {
    return <Text color="gray">No DNS records found.</Text>
  }

  const truncate = (s: string, max = 60) =>
    s.length > max ? s.slice(0, max - 1) + "…" : s

  const rows = records.flatMap((r) =>
    r.rrset_values.map((v) => ({
      NAME: r.rrset_name,
      TYPE: r.rrset_type,
      TTL: String(r.rrset_ttl),
      VALUE: truncate(v),
    })),
  )

  return (
    <Box flexDirection="column">
      <Table headers={["NAME", "TYPE", "TTL", "VALUE"]} rows={rows} />
      <Box marginTop={1}>
        <Text color="gray">
          {records.length} record{records.length !== 1 ? "s" : ""}
        </Text>
      </Box>
    </Box>
  )
}

export default DnsList
