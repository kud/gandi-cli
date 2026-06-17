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

**A modern CLI for the Gandi v5 REST API.**

<a href="https://kud.io/projects/gandi-cli">Website</a> · <a href="https://kud.io/projects/gandi-cli/docs">Documentation</a>

</div>

---

A modern CLI for the Gandi v5 REST API — manage your domains and LiveDNS records from the terminal.

## ✨ Features

- 🌐 **Domain Management** — List all registered domains with expiry dates and statuses, and renew them for one or more years
- 🔧 **Full DNS Control** — List, create, update, and delete LiveDNS records with support for custom TTLs and all standard record types
- 🩺 **Permission Doctor** — Built-in `gandi doctor` checks your PAT scopes and shows exactly which commands are unlocked
- 🔐 **PAT Authentication** — Uses Gandi Personal Access Tokens with fine-grained scope control — only grant what you need
- ⚡ **Rich Terminal UI** — Built with Ink and React for spinners, aligned tables, and clean formatted output
- 📦 **Zero Config** — Set one env var or add one line to a TOML file and you're ready to go

## 🚀 Install

```sh
npm install -g @kud/gandi-cli
```

## 📖 Documentation

Full usage, options, and examples live on the docs site:

**→ [kud.io/projects/gandi-cli/docs](https://kud.io/projects/gandi-cli/docs)**

## 🔧 Development

```sh
git clone https://github.com/kud/gandi-cli.git
cd gandi-cli
npm install
npm run dev -- doctor
```

## License

MIT © [kud](https://github.com/kud)
