import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { getDomain } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { Domain } from "../types/gandi.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"

const day = (iso?: string) => (iso ? iso.slice(0, 10) : "—")

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Box width={14}>
      <Text color="gray">{label}</Text>
    </Box>
    <Text>{value}</Text>
  </Box>
)

const DomainInfo = ({ domain }: { domain: string }) => {
  const [info, setInfo] = useState<Domain | null>(null)
  const [error, setError] = useState<Error | null>(null)

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
  if (!info) return <SpinnerAction label={`Fetching ${domain}…`} />

  const status = info.status.length ? info.status.join(", ") : "active"
  const autorenew = info.autorenew
    ? info.autorenew.enabled
      ? `on${info.autorenew.duration ? ` (${info.autorenew.duration}y)` : ""}`
      : "off"
    : "—"
  const nameservers = info.nameservers?.length
    ? info.nameservers.join(", ")
    : (info.name_server?.current ?? "—")

  return (
    <Box flexDirection="column">
      <Text bold>{info.fqdn_unicode}</Text>
      <Box flexDirection="column" marginTop={1}>
        <Row label="Status" value={status} />
        <Row label="Created" value={day(info.dates.created_at)} />
        <Row label="Expires" value={day(info.dates.registry_ends_at)} />
        <Row label="Nameservers" value={nameservers} />
        <Row label="Auto-renew" value={autorenew} />
        {info.services?.length ? (
          <Row label="Services" value={info.services.join(", ")} />
        ) : null}
      </Box>
    </Box>
  )
}

export default DomainInfo
