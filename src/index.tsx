#!/usr/bin/env node
import React from "react"
import { readFileSync } from "fs"
import { render } from "ink"
import { Command } from "commander"
import Doctor from "./commands/doctor.js"
import DomainList from "./commands/domain-list.js"
import DomainRenew from "./commands/domain-renew.js"
import DomainInfo from "./commands/domain-info.js"
import DomainAvailable from "./commands/domain-available.js"
import DomainAutorenew from "./commands/domain-autorenew.js"
import DomainNameservers from "./commands/domain-nameservers.js"
import DnsList from "./commands/dns-list.js"
import DnsSet from "./commands/dns-set.js"
import DnsAdd from "./commands/dns-add.js"
import DnsGet from "./commands/dns-get.js"
import DnsDelete from "./commands/dns-delete.js"
import RedirectList from "./commands/redirect-list.js"
import RedirectAdd from "./commands/redirect-add.js"
import RedirectDelete from "./commands/redirect-delete.js"
import CommandError from "./components/command-error.js"
import { exportZone } from "./lib/api.js"
import { getApiKey } from "./lib/config.js"

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string }

const program = new Command()

program
  .name("gandi")
  .description("Modern CLI for the Gandi v5 REST API")
  .version(pkg.version)
  .showHelpAfterError("(add --help for usage)")

program
  .command("doctor")
  .description("Check token info and permissions")
  .action(() => void render(<Doctor />))

const domain = program.command("domain").description("Manage domains")

domain
  .command("list")
  .description("List all domains")
  .action(() => void render(<DomainList />))

domain
  .command("renew <domain>")
  .description("Renew a domain")
  .option("-d, --duration <years>", "Number of years to renew", "1")
  .action((d: string, opts: { duration: string }) => {
    void render(
      <DomainRenew domain={d} duration={parseInt(opts.duration, 10)} />,
    )
  })

domain
  .command("info <domain>")
  .description("Show details for a domain")
  .action((d: string) => void render(<DomainInfo domain={d} />))

domain
  .command("available <name>")
  .description("Check whether a domain is available to register")
  .action((name: string) => void render(<DomainAvailable name={name} />))

domain
  .command("autorenew <domain> <state>")
  .description("Turn auto-renew on or off")
  .action(
    (d: string, state: string) =>
      void render(<DomainAutorenew domain={d} enabled={state === "on"} />),
  )

domain
  .command("nameservers <domain>")
  .description("Show the nameservers for a domain")
  .action((d: string) => void render(<DomainNameservers domain={d} />))

const dns = program.command("dns").description("Manage LiveDNS records")

dns
  .command("list <domain>")
  .description("List DNS records for a domain")
  .action((d: string) => void render(<DnsList domain={d} />))

dns
  .command("set <domain> <type> <name> <value>")
  .description("Create or replace a DNS record")
  .option("-t, --ttl <seconds>", "TTL in seconds", "10800")
  .action(
    (
      d: string,
      type: string,
      name: string,
      value: string,
      opts: { ttl: string },
    ) => {
      void render(
        <DnsSet
          domain={d}
          type={type}
          name={name}
          value={value}
          ttl={parseInt(opts.ttl, 10)}
        />,
      )
    },
  )

dns
  .command("add <domain> <type> <name> <value>")
  .description("Append a value to a DNS record without replacing it")
  .option("-t, --ttl <seconds>", "TTL in seconds")
  .action(
    (
      d: string,
      type: string,
      name: string,
      value: string,
      opts: { ttl?: string },
    ) => {
      void render(
        <DnsAdd
          domain={d}
          type={type}
          name={name}
          value={value}
          ttl={opts.ttl ? parseInt(opts.ttl, 10) : undefined}
        />,
      )
    },
  )

dns
  .command("get <domain> <type> <name>")
  .description("Show a single DNS record")
  .action(
    (d: string, type: string, name: string) =>
      void render(<DnsGet domain={d} type={type} name={name} />),
  )

dns
  .command("export <domain>")
  .description("Export the whole zone as a BIND file")
  .action(async (d: string) => {
    try {
      process.stdout.write(await exportZone(getApiKey(), d))
    } catch (e) {
      render(<CommandError error={e as Error} />)
    }
  })

dns
  .command("delete <domain> <type> <name>")
  .description("Delete a DNS record")
  .option("-y, --yes", "Skip the confirmation prompt")
  .action((d: string, type: string, name: string, opts: { yes?: boolean }) => {
    void render(<DnsDelete domain={d} type={type} name={name} yes={opts.yes} />)
  })

const redirect = program
  .command("redirect")
  .description("Manage web redirections (web forwarding)")

redirect
  .command("list <domain>")
  .description("List web redirects for a domain")
  .action((d: string) => void render(<RedirectList domain={d} />))

redirect
  .command("add <domain> <source> <target>")
  .description("Add a web redirect")
  .option(
    "-t, --type <type>",
    "Redirect type: http301, http302, or cloak",
    "http301",
  )
  .action(
    (d: string, source: string, target: string, opts: { type: string }) =>
      void render(
        <RedirectAdd
          domain={d}
          host={source}
          target={target}
          type={opts.type}
        />,
      ),
  )

redirect
  .command("delete <domain> <source>")
  .description("Delete a web redirect")
  .option("-y, --yes", "Skip the confirmation prompt")
  .action(
    (d: string, source: string, opts: { yes?: boolean }) =>
      void render(<RedirectDelete domain={d} host={source} yes={opts.yes} />),
  )

program.parse()
