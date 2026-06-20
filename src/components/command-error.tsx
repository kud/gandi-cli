import React from "react"
import ErrorMessage from "./error.js"
import AuthGuide from "./auth-guide.js"
import { authErrorKind } from "../lib/errors.js"

const CommandError = ({ error }: { error: Error }) => {
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
