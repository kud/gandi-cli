import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { getApiKey } from "../lib/config.js"
import ErrorMessage from "../components/error.js"
import SpinnerAction from "../components/spinner-action.js"

const BASE_URL = "https://api.gandi.net/v5"

interface DomainRenewProps {
  domain: string
  duration?: number
}

const DomainRenew = ({ domain, duration = 1 }: DomainRenewProps) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        const res = await fetch(`${BASE_URL}/domain/domains/${domain}/renew`, {
          method: "POST",
          headers: {
            Authorization: `Apikey ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ duration }),
        })
        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ message: res.statusText }))
          throw new Error(
            (err as { message: string }).message ?? `HTTP ${res.status}`,
          )
        }
        setDone(true)
      } catch (e) {
        setError((e as Error).message)
      }
    }
    run()
  }, [])

  if (error) return <ErrorMessage message={error} />
  if (!done) return <SpinnerAction label={`Renewing ${domain}…`} />

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        Renewed <Text bold>{domain}</Text> for {duration} year
        {duration !== 1 ? "s" : ""}
      </Text>
    </Box>
  )
}

export default DomainRenew
