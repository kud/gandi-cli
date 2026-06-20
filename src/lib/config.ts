import { readFileSync } from "fs"
import { homedir } from "os"
import { join } from "path"
import { parse } from "smol-toml"
import { authError } from "./errors.js"

interface Config {
  api_key: string
}

const resolveApiKey = (): string => {
  if (process.env.GANDI_API_KEY) return process.env.GANDI_API_KEY

  const configPath = join(homedir(), ".config", "gandi", "config.toml")

  try {
    const raw = readFileSync(configPath, "utf8")
    const config = parse(raw) as unknown as Config
    if (config.api_key) return config.api_key
  } catch {
    // file absent or unreadable — fall through to error
  }

  throw authError("no-token", "No Gandi token found.")
}

export const getApiKey = (): string => resolveApiKey()
