#!/usr/bin/env node
import React from "react"
import { render } from "ink"
import { Command } from "commander"
import DomainList from "./commands/domain-list.js"
import DomainRenew from "./commands/domain-renew.js"
import DnsList from "./commands/dns-list.js"
import DnsSet from "./commands/dns-set.js"
import DnsDelete from "./commands/dns-delete.js"

const program = new Command()

program
  .name("gandi")
  .description("Modern CLI for the Gandi v5 REST API")
  .version("0.1.0")

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
  .command("delete <domain> <type> <name>")
  .description("Delete a DNS record")
  .action((d: string, type: string, name: string) => {
    void render(<DnsDelete domain={d} type={type} name={name} />)
  })

program.parse()
