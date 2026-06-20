import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { tryGetUserInfo, probeCapability } from "../lib/api.js"
import type { CapabilityStatus } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import { authError } from "../lib/errors.js"
import type { UserInfo } from "../types/gandi.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"

const CAPABILITIES = [
  {
    label: "View domains",
    path: "/domain/domains?per_page=1",
    commands: "gandi domain list / renew",
  },
  {
    label: "Manage DNS",
    path: "/livedns/domains",
    commands: "gandi dns list / set / delete",
  },
]

interface Capability {
  label: string
  commands: string
  status: CapabilityStatus
}

const ICON: Record<CapabilityStatus, { glyph: string; color: string }> = {
  ok: { glyph: "✔", color: "green" },
  forbidden: { glyph: "✖", color: "red" },
  error: { glyph: "?", color: "yellow" },
}

const Doctor = () => {
  const [info, setInfo] = useState<UserInfo | null>(null)
  const [caps, setCaps] = useState<Capability[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        const [user, probed] = await Promise.all([
          tryGetUserInfo(key),
          Promise.all(
            CAPABILITIES.map(async (c) => ({
              label: c.label,
              commands: c.commands,
              status: await probeCapability(key, c.path),
            })),
          ),
        ])

        const allDenied = probed.every((c) => c.status !== "ok")
        if (!user && allDenied) {
          setError(
            authError("unauthorized", "Access was denied to this token."),
          )
          return
        }

        setInfo(user)
        setCaps(probed)
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!caps) return <SpinnerAction label="Checking token…" />

  const who =
    info?.username ?? info?.name ?? "your token (identity unavailable)"

  return (
    <Box flexDirection="column" gap={1}>
      <Text>
        <Text color="green">✔ </Text>
        Authenticated as <Text bold>{who}</Text>
        {info?.email ? <Text color="gray"> ({info.email})</Text> : null}
      </Text>

      <Box flexDirection="column">
        {caps.map((c) => {
          const icon = ICON[c.status]
          return (
            <Box key={c.label} gap={2}>
              <Text color={icon.color}>{icon.glyph}</Text>
              <Box width={16}>
                <Text>{c.label}</Text>
              </Box>
              <Text color="gray">{c.commands}</Text>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default Doctor
