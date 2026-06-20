import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render } from "ink-testing-library"

vi.mock("../lib/config.js", () => ({ getApiKey: () => "token" }))
vi.mock("../lib/api.js", () => ({ listDnsRecords: vi.fn() }))

import DnsList from "./dns-list.js"
import { listDnsRecords } from "../lib/api.js"

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
    const { lastFrame } = render(<DnsList domain="ex.com" />)
    await vi.waitFor(() => expect(lastFrame() ?? "").toContain("www"))
    const out = lastFrame() ?? ""
    expect(out).toContain("1.2.3.4")
    expect(out).toContain("1 record")
  })

  it("shows an empty state when there are no records", async () => {
    mockList.mockResolvedValue([])
    const { lastFrame } = render(<DnsList domain="ex.com" />)
    await vi.waitFor(() =>
      expect(lastFrame() ?? "").toContain("No DNS records"),
    )
  })
})
