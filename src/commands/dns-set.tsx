import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { setDnsRecord } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import SpinnerAction from "../components/spinner-action.js"
import ErrorMessage from "../components/error.js"

interface DnsSetProps {
  domain: string
  type: string
  name: string
  value: string
  ttl?: number
}

const DnsSet = ({ domain, type, name, value, ttl }: DnsSetProps) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        await setDnsRecord(key, domain, type, name, [value], ttl)
        setDone(true)
      } catch (e) {
        setError((e as Error).message)
      }
    }
    run()
  }, [])

  if (error) return <ErrorMessage message={error} />
  if (!done) return <SpinnerAction label={`Setting ${type} record…`} />

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        Set <Text bold>{name}</Text> <Text color="cyan">{type}</Text> → {value}
        {ttl !== undefined ? <Text color="gray"> (TTL {ttl})</Text> : null}
      </Text>
    </Box>
  )
}

export default DnsSet
