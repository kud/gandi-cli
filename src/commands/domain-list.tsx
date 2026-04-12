import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { listDomains } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { Domain } from "../types/gandi.js"
import Table from "../components/table.js"
import SpinnerAction from "../components/spinner-action.js"
import ErrorMessage from "../components/error.js"

const DomainList = () => {
  const [domains, setDomains] = useState<Domain[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        const data = await listDomains(key)
        setDomains(data)
      } catch (e) {
        setError((e as Error).message)
      }
    }
    run()
  }, [])

  if (error) return <ErrorMessage message={error} />
  if (!domains) return <SpinnerAction label="Fetching domains…" />

  if (domains.length === 0) {
    return <Text color="gray">No domains found.</Text>
  }

  const STATUS_MAP: Record<string, string> = {
    clientTransferProhibited: "locked",
    clientDeleteProhibited: "delete-locked",
    clientUpdateProhibited: "update-locked",
    serverTransferProhibited: "server-locked",
    pendingTransfer: "transferring",
    pendingDelete: "deleting",
    pendingCreate: "creating",
  }

  const formatStatus = (statuses: string[]) => {
    if (statuses.length === 0) return "active"
    return statuses.map((s) => STATUS_MAP[s] ?? s).join(", ")
  }

  const rows = domains.map((d) => ({
    DOMAIN: d.fqdn_unicode,
    EXPIRES: d.dates.registry_ends_at
      ? new Date(d.dates.registry_ends_at).toISOString().slice(0, 10)
      : "—",
    STATUS: formatStatus(d.status),
    NAMESERVER: d.name_server?.current ?? "—",
  }))

  return (
    <Box flexDirection="column">
      <Table
        headers={["DOMAIN", "EXPIRES", "STATUS", "NAMESERVER"]}
        rows={rows}
      />
      <Box marginTop={1}>
        <Text color="gray">
          {domains.length} domain{domains.length !== 1 ? "s" : ""}
        </Text>
      </Box>
    </Box>
  )
}

export default DomainList
