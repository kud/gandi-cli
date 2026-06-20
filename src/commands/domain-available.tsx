import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import { checkDomain } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import type { DomainCheck } from "../types/gandi.js"
import SpinnerAction from "../components/spinner-action.js"
import CommandError from "../components/command-error.js"

const DomainAvailable = ({ name }: { name: string }) => {
  const [data, setData] = useState<DomainCheck | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setData(await checkDomain(getApiKey(), name))
      } catch (e) {
        setError(e as Error)
      }
    }
    run()
  }, [])

  if (error) return <CommandError error={error} />
  if (!data) return <SpinnerAction label={`Checking ${name}…`} />

  const product = data.products[0]
  if (!product)
    return <Text color="gray">No availability information for {name}.</Text>

  const available = product.status === "available"
  const price = product.prices?.[0]
  const amount = price?.price_after_taxes ?? price?.price_before_taxes

  if (!available)
    return (
      <Box>
        <Text color="red">✖ </Text>
        <Text>
          <Text bold>{name}</Text> is {product.status.replace(/_/g, " ")}
        </Text>
      </Box>
    )

  return (
    <Box>
      <Text color="green">✔ </Text>
      <Text>
        <Text bold>{name}</Text> is available
        {amount !== undefined ? (
          <Text color="gray">
            {" "}
            — {amount} {data.currency ?? ""}/{price?.duration_unit ?? "y"}
          </Text>
        ) : null}
      </Text>
    </Box>
  )
}

export default DomainAvailable
