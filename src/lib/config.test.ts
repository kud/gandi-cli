import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("fs", () => ({ readFileSync: vi.fn() }))

import { readFileSync } from "fs"
import { getApiKey } from "./config.js"
import { authErrorKind } from "./errors.js"

const mockRead = vi.mocked(readFileSync)
const original = process.env.GANDI_API_KEY

describe("getApiKey", () => {
  beforeEach(() => {
    delete process.env.GANDI_API_KEY
    mockRead.mockReset()
  })
  afterEach(() => {
    if (original === undefined) delete process.env.GANDI_API_KEY
    else process.env.GANDI_API_KEY = original
  })

  it("prefers the GANDI_API_KEY env var over the config file", () => {
    process.env.GANDI_API_KEY = "env-token"
    expect(getApiKey()).toBe("env-token")
    expect(mockRead).not.toHaveBeenCalled()
  })

  it("falls back to api_key in config.toml", () => {
    mockRead.mockReturnValue('api_key = "file-token"')
    expect(getApiKey()).toBe("file-token")
  })

  it("throws a no-token auth error when nothing is configured", () => {
    mockRead.mockImplementation(() => {
      throw new Error("ENOENT")
    })
    let thrown: unknown
    try {
      getApiKey()
    } catch (e) {
      thrown = e
    }
    expect(authErrorKind(thrown)).toBe("no-token")
  })
})
