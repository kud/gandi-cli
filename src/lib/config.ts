import { readFileSync } from "fs"
import { homedir } from "os"
import { join } from "path"
import { parse } from "smol-toml"

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

  throw new Error(
    "No API key found. Set GANDI_API_KEY or add api_key to ~/.config/gandi/config.toml",
  )
}

export const getApiKey = (): string => resolveApiKey()
