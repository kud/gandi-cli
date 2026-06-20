import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { getTokenInfo } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { TokenInfo } from "../types/gandi.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"
import { useExit } from "../hooks/use-exit.js"

const SCOPE_MAP: Record<string, { commands: string }> = {
  "domain:view": { commands: "gandi domain list" },
  "domain:renew": { commands: "gandi domain renew" },
  "domain:tech": { commands: "gandi dns list / set / delete" },
}

const formatExpiry = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`
  const hours = Math.floor(seconds / 3600)
  return `${hours} hour${hours !== 1 ? "s" : ""}`
}

const Doctor = () => {
  const [info, setInfo] = useState<TokenInfo | null>(null)
  const [error, setError] = useState<Error | null>(null)
  useExit(info !== null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        const data = await getTokenInfo(key)
        setInfo(data)
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!info) return <SpinnerAction label="Checking token…" />

  const knownScopes = Object.keys(SCOPE_MAP)

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text>
          <Text color="gray">Token </Text>
          <Text bold color="white">
            {info.pat_name}
          </Text>
        </Text>
        <Text color="gray">
          Expires in {formatExpiry(info.expires_in)} · {info.entities.length}{" "}
          {info.entities.length !== 1 ? "entities" : "entity"}
        </Text>
      </Box>

      <Box flexDirection="column">
        {knownScopes.map((scope) => {
          const has = info.scope.includes(scope)
          const entry = SCOPE_MAP[scope]
          return (
            <Box key={scope} gap={2}>
              <Text color={has ? "green" : "gray"} dimColor={!has}>
                {has ? "✓" : "○"}
              </Text>
              <Text color={has ? "white" : "gray"} dimColor={!has}>
                {scope}
              </Text>
              <Text color="gray" dimColor={!has}>
                {entry.commands}
              </Text>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default Doctor
