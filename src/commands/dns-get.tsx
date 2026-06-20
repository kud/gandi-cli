import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { getDnsRecord } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { DnsRecord } from "../types/gandi.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"
import { useExit } from "../hooks/use-exit.js"

interface DnsGetProps {
  domain: string
  type: string
  name: string
}

const DnsGet = ({ domain, type, name }: DnsGetProps) => {
  const [record, setRecord] = useState<DnsRecord | null | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)
  useExit(record !== undefined)

  useEffect(() => {
    const run = async () => {
      try {
        setRecord(await getDnsRecord(getApiKey(), domain, type, name))
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (record === undefined)
    return <SpinnerAction label={`Fetching ${type} ${name}…`} />
  if (record === null)
    return (
      <Text color="gray">
        No {type} record found for {name} on {domain}.
      </Text>
    )

  return (
    <Box flexDirection="column">
      <Text>
        <Text bold>{record.rrset_name}</Text>{" "}
        <Text color="cyan">{record.rrset_type}</Text>{" "}
        <Text color="gray">(TTL {record.rrset_ttl})</Text>
      </Text>
      {record.rrset_values.map((v, i) => (
        <Text key={i}> {v}</Text>
      ))}
    </Box>
  )
}

export default DnsGet
