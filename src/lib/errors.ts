export type AuthErrorKind = "no-token" | "unauthorized"

export const authError = (kind: AuthErrorKind, message: string): Error =>
  Object.assign(new Error(message), { kind })

export const authErrorKind = (error: unknown): AuthErrorKind | null => {
  const kind = (error as { kind?: unknown } | null)?.kind
  return kind === "no-token" || kind === "unauthorized" ? kind : null
}
