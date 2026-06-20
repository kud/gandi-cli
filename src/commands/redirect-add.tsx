import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { addRedirect } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"
import { useExit } from "../hooks/use-exit.js"

interface RedirectAddProps {
  domain: string
  host: string
  target: string
  type: string
}

const RedirectAdd = ({ domain, host, target, type }: RedirectAddProps) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  useExit(done)

  useEffect(() => {
    const run = async () => {
      try {
        await addRedirect(getApiKey(), domain, host, target, type)
        setDone(true)
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!done) return <SpinnerAction label={`Adding ${type} redirect…`} />

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        <Text bold>
          {host || "@"}.{domain}
        </Text>{" "}
        <Text color="cyan">{type}</Text> → {target}
      </Text>
    </Box>
  )
}

export default RedirectAdd
