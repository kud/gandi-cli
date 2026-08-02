import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderFrames } from "@kud/cli-testing"
import DangerousAction from "./dangerous-action.js"


describe("DangerousAction", () => {
  beforeEach(() => {
    process.exitCode = 0
  })
  afterEach(() => {
    process.exitCode = 0
  })

  it("blocks and does not run without --yes", () => {
    const run = vi.fn().mockResolvedValue(undefined)
    const ui = renderFrames(
      <DangerousAction
        prompt="This will delete X."
        label="Deleting…"
        run={run}
        done={<>done</>}
      />,
    )
    expect(ui.output()).toContain("--yes")
    expect(run).not.toHaveBeenCalled()
    expect(process.exitCode).toBe(1)
  })

  it("runs and shows the done frame when --yes is given", async () => {
    const run = vi.fn().mockResolvedValue(undefined)
    const ui = renderFrames(
      <DangerousAction
        yes
        prompt="This will delete X."
        label="Deleting…"
        run={run}
        done={<>deleted-ok</>}
      />,
    )
    await ui.waitFor("deleted-ok")
    expect(run).toHaveBeenCalledTimes(1)
  })
})
