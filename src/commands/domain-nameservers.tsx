import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { getDomain } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { Domain } from "../types/gandi.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"
import { useExit } from "../hooks/use-exit.js"

const DomainNameservers = ({ domain }: { domain: string }) => {
  const [info, setInfo] = useState<Domain | null>(null)
  const [error, setError] = useState<Error | null>(null)
  useExit(info !== null)

  useEffect(() => {
    const run = async () => {
      try {
        setInfo(await getDomain(getApiKey(), domain))
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!info)
    return <SpinnerAction label={`Fetching nameservers for ${domain}…`} />

  const nameservers = info.nameservers ?? []
  if (nameservers.length === 0)
    return <Text color="gray">No nameservers found for {domain}.</Text>

  return (
    <Box flexDirection="column">
      {nameservers.map((ns) => (
        <Text key={ns}>{ns}</Text>
      ))}
    </Box>
  )
}

export default DomainNameservers
