# Changelog

All notable changes to this project are documented here.

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
