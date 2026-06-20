import React from "react"
import { Box, Text } from "ink"
import { deleteRedirect } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import DangerousAction from "../components/dangerous-action.js"

interface RedirectDeleteProps {
  domain: string
  host: string
  yes?: boolean
}

const RedirectDelete = ({ domain, host, yes }: RedirectDeleteProps) => {
  const source = `${host || "@"}.${domain}`
  return (
    <DangerousAction
      yes={yes}
      prompt={`This will delete the redirect on ${source}.`}
      label={`Deleting redirect ${source}…`}
      run={() => deleteRedirect(getApiKey(), domain, host)}
      done={
        <Box>
          <Text color="green">✔ </Text>
          <Text>
            Deleted redirect on <Text bold>{source}</Text>
          </Text>
        </Box>
      }
    />
  )
}

export default RedirectDelete
