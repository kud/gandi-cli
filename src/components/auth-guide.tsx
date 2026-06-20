import React from "react"
import { Box, Text } from "ink"
import type { AuthErrorKind } from "../lib/errors.js"

const TOKEN_PAGE = "https://admin.gandi.net"
const TOKEN_NAV = "Account → Security → Personal Access Tokens → Create"

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <Box flexDirection="column" marginTop={1}>
    <Text>
      <Text color="cyan">{n}. </Text>
      {children}
    </Text>
  </Box>
)

const Indent = ({ children }: { children: React.ReactNode }) => (
  <Box marginLeft={3} flexDirection="column">
    {children}
  </Box>
)

const SetupSteps = () => (
  <>
    <Step n={1}>Create a Personal Access Token</Step>
    <Indent>
      <Text color="blue">{TOKEN_PAGE}</Text>
      <Text color="gray">{TOKEN_NAV}</Text>
      <Text color="gray">
        Scope it to “Manage technical configuration” (domain:tech) for DNS.
      </Text>
    </Indent>
    <Step n={2}>Give it to the CLI — pick one:</Step>
    <Indent>
      <Text>
        <Text color="gray">• </Text>
        export GANDI_API_KEY=<Text color="green">&quot;your-token&quot;</Text>
      </Text>
      <Text>
        <Text color="gray">• </Text>add{" "}
        <Text color="green">api_key = &quot;your-token&quot;</Text> to{" "}
        ~/.config/gandi/config.toml
      </Text>
    </Indent>
    <Step n={3}>
      Verify: <Text color="cyan">gandi doctor</Text>
    </Step>
  </>
)

const NoToken = () => (
  <Box flexDirection="column">
    <Text>
      <Text color="red">✖ </Text>
      <Text bold>Not authenticated</Text> — no Gandi token found.
    </Text>
    <Box marginTop={1}>
      <Text color="gray">
        Gandi has no CLI login. Create a token once in the dashboard, then this
        CLI uses it.
      </Text>
    </Box>
    <SetupSteps />
  </Box>
)

const Rejected = ({ detail }: { detail?: string }) => (
  <Box flexDirection="column">
    <Text>
      <Text color="red">✖ </Text>
      <Text bold>Token rejected by Gandi.</Text>
      {detail ? <Text color="gray"> ({detail})</Text> : null}
    </Text>
    <Box marginTop={1} flexDirection="column">
      <Text color="gray">
        Your token was found but Gandi refused it. Usual causes:
      </Text>
      <Text color="gray">
        {" "}
        expired · mistyped / partial paste · missing the domain:tech scope
      </Text>
    </Box>
    <Box marginTop={1} flexDirection="column">
      <Text>
        Re-create or check it: <Text color="blue">{TOKEN_PAGE}</Text>
      </Text>
      <Text color="gray">{TOKEN_NAV}</Text>
      <Text>
        Then run: <Text color="cyan">gandi doctor</Text>
      </Text>
    </Box>
  </Box>
)

const AuthGuide = ({
  reason,
  detail,
}: {
  reason: AuthErrorKind
  detail?: string
}) => (reason === "no-token" ? <NoToken /> : <Rejected detail={detail} />)

export default AuthGuide
