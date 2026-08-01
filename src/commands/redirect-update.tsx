import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { updateRedirect } from "@kud/gandi"
import { getApiKey } from "@kud/gandi"
import type { RedirectPatch } from "@kud/gandi"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"
import { useExit } from "../hooks/use-exit.js"

interface RedirectUpdateProps {
  domain: string
  host: string
  patch: RedirectPatch
}

const describeFlags = (patch: RedirectPatch): string[] =>
  [
    patch.type && `type ${patch.type}`,
    patch.protocol && `protocol ${patch.protocol}`,
    patch.override !== undefined && `override ${patch.override}`,
  ].filter((flag): flag is string => typeof flag === "string")

const RedirectUpdate = ({ domain, host, patch }: RedirectUpdateProps) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  useExit(done)

  useEffect(() => {
    const run = async () => {
      try {
        await updateRedirect(getApiKey(), domain, host, patch)
        setDone(true)
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!done) return <SpinnerAction label={`Updating redirect ${host}…`} />

  const flags = describeFlags(patch)

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        <Text bold>{host}</Text>
        {patch.url ? ` → ${patch.url}` : ""}
        {flags.length > 0 ? ` (${flags.join(", ")})` : ""}
      </Text>
    </Box>
  )
}

export default RedirectUpdate
