# Changelog

All notable changes to this project are documented here.

---

## 0.4.0 — 2026-06-20

### Highlights

- **Major DNS expansion: `dns add`, `dns get`, and `dns export`.** You can now append a value to an existing record set without touching the rest of it (`dns add <domain> <type> <name> <value>`), inspect a single record directly (`dns get <domain> <type> <name>`), and export the entire zone as a BIND master file (`dns export <domain>`). The add command also accepts an optional `--ttl` override while preserving the existing TTL by default. ([5f366b2](https://github.com/kud/gandi-cli/commit/5f366b2fdd4e121b969029992614e543c9bd639d), [8a6ca12](https://github.com/kud/gandi-cli/commit/8a6ca1235675db49ae313cbe04ba54aad31310e8))

- **Full domain management suite.** Four new `domain` sub-commands ship in this release: `domain info` shows registration dates, status, nameservers, and auto-renew state in one glance; `domain available` checks whether a name is free to register and what it costs; `domain autorenew on|off` toggles auto-renewal; and `domain nameservers` lists the authoritative nameservers. ([8a6ca12](https://github.com/kud/gandi-cli/commit/8a6ca1235675db49ae313cbe04ba54aad31310e8))

- **New `gandi redirect` command group for web forwarding.** A complete set of subcommands — `redirect list`, `redirect add`, and `redirect delete` — lets you manage Gandi web redirections directly from the CLI. `redirect add` accepts a `--type` flag (`http301`, `http302`, or `cloak`) to control redirect behaviour. ([8a6ca12](https://github.com/kud/gandi-cli/commit/8a6ca1235675db49ae313cbe04ba54aad31310e8))

- **Destructive commands now require confirmation.** `dns delete` and `redirect delete` both block until you pass `--yes`, preventing accidental data loss. A shared `DangerousAction` guard exits with a non-zero code if the flag is absent, making it safe to call from scripts that check exit codes. ([8a6ca12](https://github.com/kud/gandi-cli/commit/8a6ca1235675db49ae313cbe04ba54aad31310e8))

### Documentation

- Every new command is documented with examples and included in the quick-reference tables. A dedicated Redirects page (`redirect.mdx`) has been added to the docs site. The authentication and doctor pages have been overhauled: French permission names replaced with English equivalents, scope identifiers added, token troubleshooting steps made explicit, and a new Troubleshooting section added to `authentication.mdx`. ([4c5b48b](https://github.com/kud/gandi-cli/commit/4c5b48b3ade660beddbe72e283564a3067772611), [8a6ca12](https://github.com/kud/gandi-cli/commit/8a6ca1235675db49ae313cbe04ba54aad31310e8))

---

## 0.3.0 — 2026-06-20

### Highlights

- **Graceful authentication onboarding.** When a command runs without a token, or Gandi's API rejects the credentials, the CLI now prints a clear step-by-step guide explaining how to create a Personal Access Token and wire it up via `GANDI_API_KEY` or `config.toml`. The old behaviour was a terse, cryptic error with no path forward. ([3e8f72e](https://github.com/kud/gandi-cli/commit/3e8f72eedb35f7bed3d291f1dba07ebf2e19ff50))

- **`gandi doctor` now uses token introspection.** The command calls Gandi's `id.gandi.net/tokeninfo` endpoint instead of probing capability URLs, so it works with least-privilege tokens and requires no extra scope. The output now shows the token name, expiry countdown, and a scope list where each item is marked granted (✓) or absent (○) — absent scopes are informational, not alarming. ([bbc06ab](https://github.com/kud/gandi-cli/commit/bbc06aba2b99b6fdc58674c3260a714aed605a2b))

- **CLI correctness across the board.** Failing commands now set a non-zero exit code, so scripts and CI pipelines can detect errors reliably. `gandi --version` reads the real version from `package.json` instead of returning a hard-coded string. Passing an invalid command now shows a `--help` hint so users know where to look. ([bab7e51](https://github.com/kud/gandi-cli/commit/bab7e516ca8f884f49fc8a0877f3bf4a4fab00fb))

### Fixes

- **`domain renew` auth fixed.** The command was using a deprecated `Apikey` authentication scheme. It now uses the `Bearer` token via the shared request helper, consistent with all other commands. ([3e8f72e](https://github.com/kud/gandi-cli/commit/3e8f72eedb35f7bed3d291f1dba07ebf2e19ff50))

### Documentation

- The docs site now injects the current version at build time, and a CSS fix prevents the copy button from overlapping code blocks. ([1008f35](https://github.com/kud/gandi-cli/commit/1008f35ee4683f301a55836b803d16dd1cc3501d), [1b68926](https://github.com/kud/gandi-cli/commit/1b689267e5ebf984e36799f3e479a5ec22a74619))
