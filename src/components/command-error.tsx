import React, { useEffect } from "react"
import ErrorMessage from "./error.js"
import AuthGuide from "./auth-guide.js"
import { authErrorKind } from "../lib/errors.js"

const CommandError = ({ error }: { error: Error }) => {
  useEffect(() => {
    process.exitCode = 1
  }, [])

  const kind = authErrorKind(error)
  if (kind)
    return (
      <AuthGuide
        reason={kind}
        detail={kind === "unauthorized" ? error.message : undefined}
      />
    )
  return <ErrorMessage message={error.message} />
}

export default CommandError
