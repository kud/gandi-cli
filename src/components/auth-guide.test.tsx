import React from "react"
import { describe, it, expect } from "vitest"
import { render } from "ink-testing-library"
import AuthGuide from "./auth-guide.js"

describe("AuthGuide", () => {
  it("shows the setup steps when no token is configured", () => {
    const { lastFrame } = render(<AuthGuide reason="no-token" />)
    const out = lastFrame() ?? ""
    expect(out).toContain("Not authenticated")
    expect(out).toContain("Personal Access Token")
    expect(out).toContain("GANDI_API_KEY")
  })

  it("shows the rejected guidance, including the server detail", () => {
    const { lastFrame } = render(
      <AuthGuide reason="unauthorized" detail="Access was denied" />,
    )
    const out = lastFrame() ?? ""
    expect(out).toContain("Token rejected")
    expect(out).toContain("Access was denied")
  })
})
