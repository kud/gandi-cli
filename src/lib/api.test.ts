import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  listDomains,
  getTokenInfo,
  getDnsRecord,
  addDnsValue,
  setDnsRecord,
  exportZone,
  checkDomain,
  listRedirects,
  toRedirectHost,
  addRedirect,
  updateRedirect,
  deleteRedirect,
} from "./api.js"
import { authErrorKind } from "./errors.js"

const res = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 401 ? "Unauthorized" : "Error",
  json: async () => body,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
})

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

const reject = async (p: Promise<unknown>) =>
  p.then(() => undefined).catch((e) => e)

describe("request error mapping", () => {
  it("maps 401 to an unauthorized auth error", async () => {
    fetchMock.mockResolvedValue(res(401, { message: "denied" }))
    expect(authErrorKind(await reject(listDomains("k")))).toBe("unauthorized")
  })

  it("maps 403 to an unauthorized auth error", async () => {
    fetchMock.mockResolvedValue(res(403, { message: "denied" }))
    expect(authErrorKind(await reject(listDomains("k")))).toBe("unauthorized")
  })

  it("maps other failures to a plain Error carrying the API message", async () => {
    fetchMock.mockResolvedValue(res(500, { message: "boom" }))
    const e = (await reject(listDomains("k"))) as Error
    expect(authErrorKind(e)).toBeNull()
    expect(e.message).toBe("boom")
  })

  it("sends a Bearer token", async () => {
    fetchMock.mockResolvedValue(res(200, []))
    await listDomains("my-token")
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer my-token",
    )
  })
})

describe("getTokenInfo", () => {
  it("introspects the token against id.gandi.net", async () => {
    fetchMock.mockResolvedValue(
      res(200, { pat_name: "cli", scope: [], entities: [], expires_in: 99 }),
    )
    const info = await getTokenInfo("k")
    expect(info.pat_name).toBe("cli")
    expect(fetchMock.mock.calls[0][0]).toContain("id.gandi.net/tokeninfo")
  })

  it("maps a 401 to an unauthorized auth error", async () => {
    fetchMock.mockResolvedValue(res(401, { message: "no" }))
    expect(authErrorKind(await reject(getTokenInfo("k")))).toBe("unauthorized")
  })
})

describe("getDnsRecord", () => {
  it("returns null on 404", async () => {
    fetchMock.mockResolvedValue(res(404, {}))
    expect(await getDnsRecord("k", "ex.com", "A", "www")).toBeNull()
  })

  it("throws an unauthorized auth error on 403", async () => {
    fetchMock.mockResolvedValue(res(403, { message: "denied" }))
    expect(
      authErrorKind(await reject(getDnsRecord("k", "ex.com", "A", "www"))),
    ).toBe("unauthorized")
  })
})

describe("setDnsRecord", () => {
  it("PUTs the values and TTL", async () => {
    fetchMock.mockResolvedValue(res(201, { message: "ok" }))
    await setDnsRecord("k", "ex.com", "A", "www", ["1.2.3.4"], 300)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toContain("/livedns/domains/ex.com/records/www/A")
    expect(opts.method).toBe("PUT")
    expect(JSON.parse(opts.body)).toEqual({
      rrset_ttl: 300,
      rrset_values: ["1.2.3.4"],
    })
  })
})

describe("addDnsValue", () => {
  const existing = {
    rrset_name: "www",
    rrset_type: "A",
    rrset_ttl: 600,
    rrset_values: ["1.2.3.4"],
  }

  it("appends a value, preserving the existing TTL", async () => {
    fetchMock
      .mockResolvedValueOnce(res(200, existing)) // GET current
      .mockResolvedValueOnce(res(201, { message: "ok" })) // PUT
    const out = await addDnsValue("k", "ex.com", "A", "www", "5.6.7.8")
    expect(out).toEqual({ added: true, values: ["1.2.3.4", "5.6.7.8"] })
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      rrset_ttl: 600,
      rrset_values: ["1.2.3.4", "5.6.7.8"],
    })
  })

  it("is a no-op (no PUT) when the value already exists", async () => {
    fetchMock.mockResolvedValueOnce(res(200, existing))
    const out = await addDnsValue("k", "ex.com", "A", "www", "1.2.3.4")
    expect(out).toEqual({ added: false, values: ["1.2.3.4"] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("creates the record with a default TTL when none exists (404)", async () => {
    fetchMock
      .mockResolvedValueOnce(res(404, { message: "not found" }))
      .mockResolvedValueOnce(res(201, { message: "ok" }))
    const out = await addDnsValue("k", "ex.com", "TXT", "@", "v=spf1")
    expect(out).toEqual({ added: true, values: ["v=spf1"] })
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      rrset_ttl: 10800,
      rrset_values: ["v=spf1"],
    })
  })
})

describe("exportZone", () => {
  it("requests text/plain and returns the raw zone", async () => {
    fetchMock.mockResolvedValue(res(200, "; zone\nwww 600 IN A 1.2.3.4\n"))
    const zone = await exportZone("k", "ex.com")
    expect(zone).toContain("www 600 IN A")
    expect(fetchMock.mock.calls[0][1].headers.Accept).toBe("text/plain")
  })
})

describe("checkDomain", () => {
  it("url-encodes the domain name", async () => {
    fetchMock.mockResolvedValue(res(200, { products: [] }))
    await checkDomain("k", "ex ample.com")
    expect(fetchMock.mock.calls[0][0]).toContain("name=ex%20ample.com")
  })
})

describe("listRedirects", () => {
  const page = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      host: `h${i}.ex.com`,
      type: "http301",
    }))

  it("returns everything when a single short page covers it", async () => {
    fetchMock.mockResolvedValue(res(200, page(3)))
    expect(await listRedirects("k", "ex.com")).toHaveLength(3)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("pages past the first response instead of truncating", async () => {
    fetchMock
      .mockResolvedValueOnce(res(200, page(100)))
      .mockResolvedValueOnce(res(200, page(14)))
    expect(await listRedirects("k", "ex.com")).toHaveLength(114)
    expect(fetchMock.mock.calls[0][0]).toContain("page=1&per_page=100")
    expect(fetchMock.mock.calls[1][0]).toContain("page=2&per_page=100")
  })

  it("stops on an empty page when the total is an exact multiple", async () => {
    fetchMock
      .mockResolvedValueOnce(res(200, page(100)))
      .mockResolvedValueOnce(res(200, []))
    expect(await listRedirects("k", "ex.com")).toHaveLength(100)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("throws rather than return a truncated list if pages never run short", async () => {
    fetchMock.mockResolvedValue(res(200, page(100)))
    const e = (await reject(listRedirects("k", "ex.com"))) as Error
    expect(e.message).toContain("may be incomplete")
  })
})

describe("toRedirectHost", () => {
  it("qualifies a bare label with the domain", () => {
    expect(toRedirectHost("ex.com", "www")).toBe("www.ex.com")
  })

  it("leaves an already-qualified host untouched", () => {
    expect(toRedirectHost("ex.com", "www.ex.com")).toBe("www.ex.com")
  })

  it("qualifies a multi-level label", () => {
    expect(toRedirectHost("ex.com", "a.b")).toBe("a.b.ex.com")
  })

  it("treats an empty host and @ as the apex", () => {
    expect(toRedirectHost("ex.com", "")).toBe("ex.com")
    expect(toRedirectHost("ex.com", "@")).toBe("ex.com")
    expect(toRedirectHost("ex.com", "ex.com")).toBe("ex.com")
  })

  it("is idempotent, so normalising twice is safe", () => {
    const once = toRedirectHost("ex.com", "www")
    expect(toRedirectHost("ex.com", once)).toBe(once)
  })

  it("does not mistake a domain that merely ends in the same letters", () => {
    expect(toRedirectHost("ex.com", "www.notex.com")).toBe(
      "www.notex.com.ex.com",
    )
  })
})

describe("addRedirect", () => {
  it("POSTs a fully-qualified host even when given a bare label", async () => {
    fetchMock.mockResolvedValue(res(201, { message: "ok" }))
    await addRedirect("k", "ex.com", "www", "https://ex.org", "http301")
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toContain("/domain/domains/ex.com/webredirs")
    expect(opts.method).toBe("POST")
    expect(JSON.parse(opts.body)).toEqual({
      host: "www.ex.com",
      url: "https://ex.org",
      type: "http301",
    })
  })
})

describe("updateRedirect", () => {
  it("PATCHes the fully-qualified host path", async () => {
    fetchMock.mockResolvedValue(res(200, { message: "ok" }))
    await updateRedirect("k", "ex.com", "www", { url: "https://ex.net" })
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toContain("/domain/domains/ex.com/webredirs/www.ex.com")
    expect(opts.method).toBe("PATCH")
  })

  it("sends only the supplied fields, so untouched ones are left alone", async () => {
    fetchMock.mockResolvedValue(res(200, { message: "ok" }))
    await updateRedirect("k", "ex.com", "www", { type: "http302" })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      type: "http302",
    })
  })

  it("distinguishes override:false from an omitted override", async () => {
    fetchMock.mockResolvedValue(res(200, { message: "ok" }))
    await updateRedirect("k", "ex.com", "www", { override: false })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      override: false,
    })
  })
})

describe("deleteRedirect", () => {
  it("DELETEs the fully-qualified host path, not the bare label", async () => {
    fetchMock.mockResolvedValue(res(204, undefined))
    await deleteRedirect("k", "ex.com", "www")
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/domain\/domains\/ex\.com\/webredirs\/www\.ex\.com$/)
    expect(opts.method).toBe("DELETE")
  })
})
