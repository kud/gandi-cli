import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { addDnsValue } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"

interface DnsAddProps {
  domain: string
  type: string
  name: string
  value: string
  ttl?: number
}

const DnsAdd = ({ domain, type, name, value, ttl }: DnsAddProps) => {
  const [result, setResult] = useState<{
    added: boolean
    values: string[]
  } | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        setResult(await addDnsValue(key, domain, type, name, value, ttl))
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!result) return <SpinnerAction label={`Adding ${type} record…`} />

  if (!result.added) {
    return (
      <Box>
        <Text color="gray">• </Text>
        <Text>
          <Text bold>{value}</Text> already present on {name}{" "}
          <Text color="cyan">{type}</Text>
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        Added <Text bold>{value}</Text> to {name}{" "}
        <Text color="cyan">{type}</Text>
        <Text color="gray">
          {" "}
          ({result.values.length} value
          {result.values.length !== 1 ? "s" : ""})
        </Text>
      </Text>
    </Box>
  )
}

export default DnsAdd
