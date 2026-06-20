import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render } from "ink-testing-library"
import DangerousAction from "./dangerous-action.js"

const output = (frames: string[]) => frames.join("\n")

describe("DangerousAction", () => {
  beforeEach(() => {
    process.exitCode = 0
  })
  afterEach(() => {
    process.exitCode = 0
  })

  it("blocks and does not run without --yes", () => {
    const run = vi.fn().mockResolvedValue(undefined)
    const { frames } = render(
      <DangerousAction
        prompt="This will delete X."
        label="Deleting…"
        run={run}
        done={<>done</>}
      />,
    )
    expect(output(frames)).toContain("--yes")
    expect(run).not.toHaveBeenCalled()
    expect(process.exitCode).toBe(1)
  })

  it("runs and shows the done frame when --yes is given", async () => {
    const run = vi.fn().mockResolvedValue(undefined)
    const { frames } = render(
      <DangerousAction
        yes
        prompt="This will delete X."
        label="Deleting…"
        run={run}
        done={<>deleted-ok</>}
      />,
    )
    await vi.waitFor(() => expect(output(frames)).toContain("deleted-ok"))
    expect(run).toHaveBeenCalledTimes(1)
  })
})
