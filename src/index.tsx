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
import {
  listDomains,
  getDomain,
  checkDomain,
  renewDomain,
  setAutorenew,
  listDnsRecords,
  getDnsRecord,
  setDnsRecord,
  addDnsValue,
  deleteDnsRecord,
  exportZone,
  listRedirects,
  addRedirect,
  deleteRedirect,
  getTokenInfo,
} from "./lib/api.js"
import { getApiKey } from "./lib/config.js"

// Exit cleanly when a downstream reader closes the pipe early (e.g. `| head`,
// or `| jq` that errors out) instead of crashing on the write.
process.stdout.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EPIPE") process.exit(0)
  throw err
})

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string }

const wantsJson = process.argv.includes("--json")

// In JSON mode, run the data fetch and print structured output (data to stdout,
// errors as JSON to stderr with a non-zero exit). Otherwise render the Ink UI.
const execute = (
  fetch: () => Promise<unknown>,
  ink: () => React.ReactElement,
) => {
  if (!wantsJson) {
    render(ink())
    return
  }
  fetch()
    .then((data) =>
      process.stdout.write(
        JSON.stringify(data ?? { ok: true }, null, 2) + "\n",
      ),
    )
    .catch((e) => {
      process.stderr.write(
        JSON.stringify({ error: (e as Error).message }) + "\n",
      )
      process.exitCode = 1
    })
}

const program = new Command()

program
  .name("gandi")
  .description("Modern CLI for the Gandi v5 REST API")
  .version(pkg.version)
  .option(
    "--json",
    "Output JSON instead of formatted text (for scripts and AI)",
  )
  .showHelpAfterError("(add --help for usage)")

program
  .command("doctor")
  .description("Check token info and permissions")
  .action(() =>
    execute(
      () => getTokenInfo(getApiKey()),
      () => <Doctor />,
    ),
  )

const domain = program.command("domain").description("Manage domains")

domain
  .command("list")
  .description("List all domains")
  .action(() =>
    execute(
      () => listDomains(getApiKey()),
      () => <DomainList />,
    ),
  )

domain
  .command("renew <domain>")
  .description("Renew a domain")
  .option("-d, --duration <years>", "Number of years to renew", "1")
  .action((d: string, opts: { duration: string }) => {
    const duration = parseInt(opts.duration, 10)
    execute(
      async () => {
        await renewDomain(getApiKey(), d, duration)
        return { ok: true, domain: d, duration }
      },
      () => <DomainRenew domain={d} duration={duration} />,
    )
  })

domain
  .command("info <domain>")
  .description("Show details for a domain")
  .action((d: string) =>
    execute(
      () => getDomain(getApiKey(), d),
      () => <DomainInfo domain={d} />,
    ),
  )

domain
  .command("available <name>")
  .description("Check whether a domain is available to register")
  .action((name: string) =>
    execute(
      () => checkDomain(getApiKey(), name),
      () => <DomainAvailable name={name} />,
    ),
  )

domain
  .command("autorenew <domain> <state>")
  .description("Turn auto-renew on or off")
  .action((d: string, state: string) => {
    const enabled = state === "on"
    execute(
      async () => {
        await setAutorenew(getApiKey(), d, enabled)
        return { ok: true, domain: d, enabled }
      },
      () => <DomainAutorenew domain={d} enabled={enabled} />,
    )
  })

domain
  .command("nameservers <domain>")
  .description("Show the nameservers for a domain")
  .action((d: string) =>
    execute(
      async () => ({
        nameservers: (await getDomain(getApiKey(), d)).nameservers ?? [],
      }),
      () => <DomainNameservers domain={d} />,
    ),
  )

const dns = program.command("dns").description("Manage LiveDNS records")

dns
  .command("list <domain>")
  .description("List DNS records for a domain")
  .action((d: string) =>
    execute(
      () => listDnsRecords(getApiKey(), d),
      () => <DnsList domain={d} />,
    ),
  )

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
      const ttl = parseInt(opts.ttl, 10)
      execute(
        async () => {
          await setDnsRecord(getApiKey(), d, type, name, [value], ttl)
          return { ok: true, name, type, values: [value], ttl }
        },
        () => (
          <DnsSet domain={d} type={type} name={name} value={value} ttl={ttl} />
        ),
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
      const ttl = opts.ttl ? parseInt(opts.ttl, 10) : undefined
      execute(
        () => addDnsValue(getApiKey(), d, type, name, value, ttl),
        () => (
          <DnsAdd domain={d} type={type} name={name} value={value} ttl={ttl} />
        ),
      )
    },
  )

dns
  .command("get <domain> <type> <name>")
  .description("Show a single DNS record")
  .action((d: string, type: string, name: string) =>
    execute(
      () => getDnsRecord(getApiKey(), d, type, name),
      () => <DnsGet domain={d} type={type} name={name} />,
    ),
  )

dns
  .command("export <domain>")
  .description("Export the whole zone as a BIND file")
  .action(async (d: string) => {
    try {
      const zone = await exportZone(getApiKey(), d)
      process.stdout.write(wantsJson ? JSON.stringify({ zone }) + "\n" : zone)
    } catch (e) {
      if (wantsJson) {
        process.stderr.write(
          JSON.stringify({ error: (e as Error).message }) + "\n",
        )
        process.exitCode = 1
      } else {
        render(<CommandError error={e as Error} />)
      }
    }
  })

dns
  .command("delete <domain> <type> <name>")
  .description("Delete a DNS record")
  .option("-y, --yes", "Skip the confirmation prompt")
  .action((d: string, type: string, name: string, opts: { yes?: boolean }) =>
    execute(
      async () => {
        if (!opts.yes) throw new Error("Refusing to delete without --yes")
        await deleteDnsRecord(getApiKey(), d, type, name)
        return { ok: true, deleted: { domain: d, type, name } }
      },
      () => <DnsDelete domain={d} type={type} name={name} yes={opts.yes} />,
    ),
  )

const redirect = program
  .command("redirect")
  .description("Manage web redirections (web forwarding)")

redirect
  .command("list <domain>")
  .description("List web redirects for a domain")
  .action((d: string) =>
    execute(
      () => listRedirects(getApiKey(), d),
      () => <RedirectList domain={d} />,
    ),
  )

redirect
  .command("add <domain> <source> <target>")
  .description("Add a web redirect")
  .option(
    "-t, --type <type>",
    "Redirect type: http301, http302, or cloak",
    "http301",
  )
  .action((d: string, source: string, target: string, opts: { type: string }) =>
    execute(
      async () => {
        await addRedirect(getApiKey(), d, source, target, opts.type)
        return { ok: true, source, target, type: opts.type }
      },
      () => (
        <RedirectAdd
          domain={d}
          host={source}
          target={target}
          type={opts.type}
        />
      ),
    ),
  )

redirect
  .command("delete <domain> <source>")
  .description("Delete a web redirect")
  .option("-y, --yes", "Skip the confirmation prompt")
  .action((d: string, source: string, opts: { yes?: boolean }) =>
    execute(
      async () => {
        if (!opts.yes) throw new Error("Refusing to delete without --yes")
        await deleteRedirect(getApiKey(), d, source)
        return { ok: true, deleted: { domain: d, source } }
      },
      () => <RedirectDelete domain={d} host={source} yes={opts.yes} />,
    ),
  )

program.parse(process.argv.filter((a) => a !== "--json"))
