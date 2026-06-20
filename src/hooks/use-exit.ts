import { useEffect } from "react"
import { useApp } from "ink"

// One-shot commands render their final frame and then need to unmount, or Ink
// keeps the process alive in a TTY (holding stdin for Ctrl+C). Calling exit()
// once the terminal state is reached leaves the output on screen and returns to
// the prompt.
export const useExit = (ready: boolean) => {
  const { exit } = useApp()
  useEffect(() => {
    if (ready) exit()
  }, [ready, exit])
}
