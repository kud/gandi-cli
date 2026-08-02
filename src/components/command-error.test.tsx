import React from "react"
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { renderFrames } from "@kud/cli-testing"
import CommandError from "./command-error.js"
import { authError } from "@kud/gandi"

// CommandError calls useExit(true), which unmounts the component right after it
// renders — so assert on the full frame history, not the (now-empty) last frame.

describe("CommandError", () => {
  beforeEach(() => {
    process.exitCode = 0
  })
  afterEach(() => {
    process.exitCode = 0
  })

  it("routes a no-token error to the setup guide", () => {
    const ui = renderFrames(
      <CommandError error={authError("no-token", "x")} />,
    )
    expect(ui.output()).toContain("Not authenticated")
  })

  it("routes an unauthorized error to the rejected guide", () => {
    const ui = renderFrames(
      <CommandError error={authError("unauthorized", "denied")} />,
    )
    expect(ui.output()).toContain("Token rejected")
  })

  it("shows a plain message for non-auth errors", () => {
    const ui = renderFrames(<CommandError error={new Error("boom")} />)
    expect(ui.output()).toContain("boom")
  })

  it("sets a non-zero exit code", () => {
    renderFrames(<CommandError error={new Error("boom")} />)
    expect(process.exitCode).toBe(1)
  })
})
