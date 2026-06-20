import { describe, it, expect } from "vitest"
import { authError, authErrorKind } from "./errors.js"

describe("authError", () => {
  it("creates an Error tagged with the kind", () => {
    const e = authError("no-token", "nope")
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toBe("nope")
    expect((e as { kind?: string }).kind).toBe("no-token")
  })
})

describe("authErrorKind", () => {
  it("returns the kind for tagged auth errors", () => {
    expect(authErrorKind(authError("unauthorized", "x"))).toBe("unauthorized")
    expect(authErrorKind(authError("no-token", "x"))).toBe("no-token")
  })

  it("returns null for plain errors, non-errors, and unknown kinds", () => {
    expect(authErrorKind(new Error("plain"))).toBeNull()
    expect(authErrorKind(null)).toBeNull()
    expect(authErrorKind(undefined)).toBeNull()
    expect(authErrorKind({ kind: "bogus" })).toBeNull()
  })
})
