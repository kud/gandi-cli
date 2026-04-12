import React from "react"
import { Box, Text } from "ink"

type Row = Record<string, string>

interface TableProps {
  headers: string[]
  rows: Row[]
}

const pad = (str: string, len: number) => str.padEnd(len)

const Table = ({ headers, rows }: TableProps) => {
  const widths = headers.map((h) =>
    Math.max(h.length, ...rows.map((r) => (r[h] ?? "").length)),
  )

  return (
    <Box flexDirection="column">
      <Box>
        {headers.map((h, i) => (
          <Text key={h} color="cyan" bold>
            {pad(h, widths[i])}
            {"  "}
          </Text>
        ))}
      </Box>
      <Box>
        {headers.map((h, i) => (
          <Text key={h} color="gray">
            {pad("─".repeat(widths[i]), widths[i])}
            {"  "}
          </Text>
        ))}
      </Box>
      {rows.map((row, ri) => (
        <Box key={ri}>
          {headers.map((h, i) => (
            <Text key={h}>
              {pad(row[h] ?? "", widths[i])}
              {"  "}
            </Text>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default Table
