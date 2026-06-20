import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { renewDomain } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import CommandError from "../components/command-error.js"
import SpinnerAction from "../components/spinner-action.js"

interface DomainRenewProps {
  domain: string
  duration?: number
}

const DomainRenew = ({ domain, duration = 1 }: DomainRenewProps) => {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const key = getApiKey()
        await renewDomain(key, domain, duration)
        setDone(true)
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
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
