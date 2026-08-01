import React from "react"
import { render } from "ink"
import { GandiBody } from "@kud/gandi-ink"
import { authErrorKind, getApiKey } from "@kud/gandi"
import AuthGuide from "./components/auth-guide.js"

// The browser itself lives in @kud/gandi-ink so that another host — a dashboard
// pane — can mount the same component rather than shelling out to `gandi`. All
// that remains here is the terminal lifecycle, which only a standalone CLI
// should own, and resolving the credential before any of it starts.
//
// The token is read here rather than left to the component: getApiKey() throws
// when none is configured, and a throw inside the render happens after the
// alternate screen is up — its message lands in a buffer torn down microseconds
// later, so the command looks like it exited silently. The guidance only
// survives if it precedes the switch.
export const startBrowse = async (): Promise<void> => {
  let apiKey: string
  try {
    apiKey = getApiKey()
  } catch (error) {
    const reason = authErrorKind(error)
    render(<AuthGuide reason={reason ?? "no-token"} />)
    process.exitCode = 1
    return
  }

  const { unmount, waitUntilExit } = render(
    <GandiBody apiKey={apiKey} onExit={() => unmount()} />,
    { alternateScreen: true },
  )
  await waitUntilExit()
}
