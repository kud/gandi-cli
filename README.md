```
 ██████╗  █████╗ ███╗  ██╗██████╗ ██╗      ██████╗██╗     ██╗
██╔════╝ ██╔══██╗████╗ ██║██╔══██╗██║     ██╔════╝██║     ██║
██║  ███╗███████║██╔██╗██║██║  ██║██║     ██║     ██║     ██║
██║   ██║██╔══██║██║╚████║██║  ██║██║     ██║     ██║     ██║
╚██████╔╝██║  ██║██║ ╚███║██████╔╝███████╗╚██████╗███████╗██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚══╝╚═════╝ ╚══════╝ ╚═════╝╚══════╝╚═╝
```

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-%40kud%2Fgandi--cli-CB3837?style=flat-square&logo=npm&logoColor=white)
![MIT](https://img.shields.io/badge/licence-MIT-22C55E?style=flat-square)

**A modern CLI for the Gandi v5 REST API — manage your domains and LiveDNS records from the terminal.**

<a href="https://kud.io/projects/gandi-cli">Website</a> · <a href="https://kud.io/projects/gandi-cli/docs">Documentation</a>

</div>

---

## Features

- **Domain management** — list registered domains with expiry dates and statuses, renew them for one or more years, and toggle auto-renew.
- **Full DNS control** — list, create, update, and delete LiveDNS records with custom TTLs and every standard record type.
- **Web redirects** — manage Gandi web forwarding with 301/302 rules straight from the terminal.
- **Permission doctor** — `gandi doctor` reports your token's name, expiry, and scopes, and shows which commands each scope unlocks.
- **PAT authentication** — fine-grained, least-privilege Gandi Personal Access Tokens, with graceful guidance when a token is missing or rejected.
- **Script & AI friendly** — add `--json` to any command for structured output, non-zero exit codes on failure, and `--yes` to skip confirmations.

## Install

```sh
npm install -g @kud/gandi-cli
```

## Usage

```sh
# Domains
gandi domain list
gandi domain info example.com
gandi domain renew example.com --duration 2

# DNS
gandi dns list example.com
gandi dns set example.com A www 1.2.3.4 --ttl 300
gandi dns add example.com A www 5.6.7.8
```

```sh
# Redirects
gandi redirect add example.com www https://example.org

# Doctor & scripting
gandi doctor
gandi dns list example.com --json | jq '.[].name'
```

## Development

```sh
git clone https://github.com/kud/gandi-cli.git
cd gandi-cli
npm install
npm run dev -- doctor
```

---

📚 **Full documentation → https://kud.io/projects/gandi-cli/docs**
