import React from "react"
import { Box, Text } from "ink"

type Row = Record<string, string>

interface TableProps {
  headers: string[]
  rows: Row[]
}

const Table = ({ headers, rows }: TableProps) => {
  const widths = headers.map((h) =>
    Math.max(h.length, ...rows.map((r) => (r[h] ?? "").length)),
  )

  return (
    <Box flexDirection="column">
      <Box>
        {headers.map((h, i) => (
          <Box key={h} minWidth={widths[i] + 2}>
            <Text color="cyan" bold>
              {h}
            </Text>
          </Box>
        ))}
      </Box>
      <Box>
        {headers.map((h, i) => (
          <Box key={h} minWidth={widths[i] + 2}>
            <Text color="gray">{"─".repeat(widths[i])}</Text>
          </Box>
        ))}
      </Box>
      {rows.map((row, ri) => (
        <Box key={ri}>
          {headers.map((h, i) => (
            <Box key={h} minWidth={widths[i] + 2}>
              <Text>{row[h] ?? ""}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default Table
