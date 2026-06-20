import React from "react"
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { render } from "ink-testing-library"
import CommandError from "./command-error.js"
import { authError } from "../lib/errors.js"

// CommandError calls useExit(true), which unmounts the component right after it
// renders — so assert on the full frame history, not the (now-empty) last frame.
const output = (frames: string[]) => frames.join("\n")

describe("CommandError", () => {
  beforeEach(() => {
    process.exitCode = 0
  })
  afterEach(() => {
    process.exitCode = 0
  })

  it("routes a no-token error to the setup guide", () => {
    const { frames } = render(
      <CommandError error={authError("no-token", "x")} />,
    )
    expect(output(frames)).toContain("Not authenticated")
  })

  it("routes an unauthorized error to the rejected guide", () => {
    const { frames } = render(
      <CommandError error={authError("unauthorized", "denied")} />,
    )
    expect(output(frames)).toContain("Token rejected")
  })

  it("shows a plain message for non-auth errors", () => {
    const { frames } = render(<CommandError error={new Error("boom")} />)
    expect(output(frames)).toContain("boom")
  })

  it("sets a non-zero exit code", () => {
    render(<CommandError error={new Error("boom")} />)
    expect(process.exitCode).toBe(1)
  })
})
