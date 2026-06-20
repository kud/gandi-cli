import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { deleteDnsRecord } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"

interface DnsDeleteProps {
  domain: string
  type: string
  name: string
}

const DnsDelete = ({ domain, type, name }: DnsDeleteProps) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        await deleteDnsRecord(key, domain, type, name)
        setDone(true)
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!done) return <SpinnerAction label={`Deleting ${type} record ${name}…`} />

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        Deleted <Text bold>{name}</Text> <Text color="cyan">{type}</Text> from{" "}
        {domain}
      </Text>
    </Box>
  )
}

export default DnsDelete
