import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { listRedirects } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { WebRedir } from "../types/gandi.js"
import Table from "../components/table.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"

const RedirectList = ({ domain }: { domain: string }) => {
  const [redirects, setRedirects] = useState<WebRedir[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setRedirects(await listRedirects(getApiKey(), domain))
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!redirects)
    return <SpinnerAction label={`Fetching redirects for ${domain}…`} />

  if (redirects.length === 0)
    return <Text color="gray">No web redirects found.</Text>

  const rows = redirects.map((r) => ({
    SOURCE: `${r.host || "@"}.${domain}`,
    TYPE: r.type,
    TARGET: r.url ?? "—",
  }))

  return (
    <Box flexDirection="column">
      <Table headers={["SOURCE", "TYPE", "TARGET"]} rows={rows} />
      <Box marginTop={1}>
        <Text color="gray">
          {redirects.length} redirect{redirects.length !== 1 ? "s" : ""}
        </Text>
      </Box>
    </Box>
  )
}

export default RedirectList
