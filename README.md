# @kud/gandi-cli

A modern CLI for the [Gandi v5 REST API](https://api.gandi.net/docs/).

## Installation

```sh
npm install -g @kud/gandi-cli
```

## Authentication

Generate a personal access token at **gandi.net → Account → Partage → Créer un jeton d'accès personnel**.

Token name: `gandi-cli`  
Expiry: your preference  
Resource access: **Restreint aux produits sélectionnés**

Required permissions (Domaines section only):

| Permission                                      | Commands                            |
| ----------------------------------------------- | ----------------------------------- |
| Voir la liste de vos domaines                   | `gandi domain list`                 |
| Gérer le renouvellement de vos domaines         | `gandi domain renew`                |
| Accéder aux enregistrements DNS de vos domaines | `gandi dns list`                    |
| Gérer les enregistrements DNS de vos domaines   | `gandi dns set`, `gandi dns delete` |

No Organisation, Facturation, Web Hosting, Cloud, or SSL permissions needed.

Then export the key in your shell:

```sh
export GANDI_API_KEY="your-token-here"
```

Or add it to `~/.config/gandi/config.toml`:

```toml
api_key = "your-token-here"
```

## Usage

### Domains

```sh
gandi domain list
gandi domain renew example.com
gandi domain renew example.com --duration 2
```

### DNS

```sh
gandi dns list example.com
gandi dns set example.com A www 1.2.3.4
gandi dns set example.com A www 1.2.3.4 --ttl 3600
gandi dns delete example.com A www
```
