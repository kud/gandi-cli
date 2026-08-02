import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderFrames } from "@kud/cli-testing"

vi.mock("@kud/gandi", () => ({
  getApiKey: () => "token",
  listDnsRecords: vi.fn(),
}))

import DnsList from "./dns-list.js"
import { listDnsRecords } from "@kud/gandi"

const mockList = vi.mocked(listDnsRecords)

describe("DnsList", () => {
  beforeEach(() => {
    mockList.mockReset()
    process.exitCode = 0
  })
  afterEach(() => {
    process.exitCode = 0
  })

  it("renders a table of records", async () => {
    mockList.mockResolvedValue([
      {
        rrset_name: "www",
        rrset_type: "A",
        rrset_ttl: 600,
        rrset_href: "",
        rrset_values: ["1.2.3.4"],
      },
    ])
    const ui = renderFrames(<DnsList domain="ex.com" />)
    await ui.waitFor("www")
    expect(ui.output()).toContain("1.2.3.4")
    expect(ui.output()).toContain("1 record")
  })

  it("shows an empty state when there are no records", async () => {
    mockList.mockResolvedValue([])
    const ui = renderFrames(<DnsList domain="ex.com" />)
    await ui.waitFor("No DNS records")
  })
})
