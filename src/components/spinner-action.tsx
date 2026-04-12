import React, { useEffect, useState } from "react"
import { Box, Text } from "ink"

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

interface SpinnerActionProps {
  label: string
}

const SpinnerAction = ({ label }: SpinnerActionProps) => {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80)
    return () => clearInterval(id)
  }, [])

  return (
    <Box>
      <Text color="cyan">{FRAMES[frame]} </Text>
      <Text color="gray">{label}</Text>
    </Box>
  )
}

export default SpinnerAction
