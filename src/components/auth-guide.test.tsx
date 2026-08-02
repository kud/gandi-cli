import React from "react"
import { describe, it, expect } from "vitest"
import { renderFrames } from "@kud/cli-testing"
import AuthGuide from "./auth-guide.js"

describe("AuthGuide", () => {
  it("shows the setup steps when no token is configured", () => {
    const ui = renderFrames(<AuthGuide reason="no-token" />)
    const out = ui.lastFrame()
    expect(out).toContain("Not authenticated")
    expect(out).toContain("Personal Access Token")
    expect(out).toContain("GANDI_API_KEY")
  })

  it("shows the rejected guidance, including the server detail", () => {
    const ui = renderFrames(
      <AuthGuide reason="unauthorized" detail="Access was denied" />,
    )
    const out = ui.lastFrame()
    expect(out).toContain("Token rejected")
    expect(out).toContain("Access was denied")
  })
})
