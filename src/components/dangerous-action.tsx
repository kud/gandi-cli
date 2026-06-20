import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"
import SpinnerAction from "./spinner-action.js"
import CommandError from "./command-error.js"
import { useExit } from "../hooks/use-exit.js"

interface DangerousActionProps {
  prompt: string
  label: string
  yes?: boolean
  run: () => Promise<void>
  done: React.ReactNode
}

type Phase = "blocked" | "running" | "done"

const DangerousAction = ({
  prompt,
  label,
  yes,
  run,
  done,
}: DangerousActionProps) => {
  const [phase, setPhase] = useState<Phase>(yes ? "running" : "blocked")
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (phase !== "running") return
    run()
      .then(() => setPhase("done"))
      .catch((e) => setError(e as Error))
  }, [])

  useEffect(() => {
    if (phase === "blocked") process.exitCode = 1
  }, [])
  useExit(phase === "blocked" || phase === "done")

  if (error) return <CommandError error={error} />
  if (phase === "blocked")
    return (
      <Box flexDirection="column">
        <Text>
          <Text color="yellow">⚠ </Text>
          {prompt}
        </Text>
        <Text color="gray">
          Re-run with <Text color="cyan">--yes</Text> to confirm.
        </Text>
      </Box>
    )
  if (phase === "running") return <SpinnerAction label={label} />
  return <>{done}</>
}

export default DangerousAction
