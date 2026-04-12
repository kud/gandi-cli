import React from "react"
import { Box, Text } from "ink"

interface ErrorProps {
  message: string
}

const ErrorMessage = ({ message }: ErrorProps) => (
  <Box>
    <Text color="red">✖ </Text>
    <Text>{message}</Text>
  </Box>
)

export default ErrorMessage
