import React from "react"
import { Box, Text } from "ink"
import { deleteDnsRecord } from "../lib/api.js"
import { getApiKey } from "../lib/config.js"
import DangerousAction from "../components/dangerous-action.js"

interface DnsDeleteProps {
  domain: string
  type: string
  name: string
  yes?: boolean
}

const DnsDelete = ({ domain, type, name, yes }: DnsDeleteProps) => (
  <DangerousAction
    yes={yes}
    prompt={`This will delete the ${type} record ${name} on ${domain}.`}
    label={`Deleting ${type} record ${name}…`}
    run={() => deleteDnsRecord(getApiKey(), domain, type, name)}
    done={
      <Box>
        <Text color="green">✔ </Text>
        <Text>
          Deleted <Text bold>{name}</Text> <Text color="cyan">{type}</Text> from{" "}
          {domain}
        </Text>
      </Box>
    }
  />
)

export default DnsDelete
