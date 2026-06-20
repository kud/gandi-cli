import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { setAutorenew } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"
import { useExit } from "../hooks/use-exit.js"

interface DomainAutorenewProps {
  domain: string
  enabled: boolean
}

const DomainAutorenew = ({ domain, enabled }: DomainAutorenewProps) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  useExit(done)

  useEffect(() => {
    const run = async () => {
      try {
        await setAutorenew(getApiKey(), domain, enabled)
        setDone(true)
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!done)
    return (
      <SpinnerAction label={`Turning auto-renew ${enabled ? "on" : "off"}…`} />
    )

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        Auto-renew <Text bold>{enabled ? "on" : "off"}</Text> for {domain}
      </Text>
    </Box>
  )
}

export default DomainAutorenew
