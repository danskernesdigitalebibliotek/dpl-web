import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createFbsClient } from "./client"

const baseUrl = "https://fbs.example"
const patronInfoUrl = `${baseUrl}/external/agencyid/patrons/patronid/v4`
const holdingsBaseUrl = `${baseUrl}/external/agencyid/catalog/holdingsLogistics/v1`

const mockJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  }) as Response

const validPatronBody = {
  authenticateStatus: "VALID",
  patron: {
    name: "Test User",
    preferredPickupBranch: "DK-761500",
    emailAddress: "user@example.com",
    phoneNumber: "+4512345678",
  },
}

const validHoldingsBody = [
  {
    recordId: "12345678",
    reservations: 2,
    holdings: [{ materials: [{}, {}, {}] }],
  },
]

const buildClient = (getAuthHeader: () => Promise<string> | string = () => "Bearer abc") =>
  createFbsClient({ baseUrl, getAuthHeader })

describe("createFbsClient.getPatron", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches the patron endpoint with the auth header and returns the mapped DTO", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validPatronBody))

    const result = await buildClient().getPatron()

    expect(fetch).toHaveBeenCalledWith(patronInfoUrl, {
      method: "GET",
      headers: { authorization: "Bearer abc" },
    })
    expect(result).toEqual({
      name: "Test User",
      isLocked: false,
      preferredPickupBranchId: "DK-761500",
      emailAddress: "user@example.com",
      phoneNumber: "+4512345678",
    })
  })

  it("awaits an async auth header callback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validPatronBody))

    await buildClient(async () => "Bearer async-token").getPatron()

    expect(fetch).toHaveBeenCalledWith(
      patronInfoUrl,
      expect.objectContaining({
        headers: { authorization: "Bearer async-token" },
      })
    )
  })

  it("throws on a non-2xx response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 401))

    await expect(buildClient().getPatron()).rejects.toThrow(/401/)
  })

  it("throws on a 5xx response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 503))

    await expect(buildClient().getPatron()).rejects.toThrow(/503/)
  })

  it("throws when the response shape fails validation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ authenticateStatus: "SOMETHING_NEW" })
    )

    await expect(buildClient().getPatron()).rejects.toThrow()
  })
})

describe("createFbsClient.getMaterialAvailability", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("short-circuits without calling fetch when given no recordIds", async () => {
    const result = await buildClient().getMaterialAvailability([])

    expect(fetch).not.toHaveBeenCalled()
    expect(result).toEqual({ totalCopies: 0, reservationCount: 0 })
  })

  it("fetches with repeated recordid query params and returns the aggregated DTO", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validHoldingsBody))

    const result = await buildClient().getMaterialAvailability(["12345678", "87654321"])

    expect(fetch).toHaveBeenCalledTimes(1)
    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl.startsWith(`${holdingsBaseUrl}?`)).toBe(true)
    expect(calledUrl).toContain("recordid=12345678")
    expect(calledUrl).toContain("recordid=87654321")
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({
      method: "GET",
      headers: { authorization: "Bearer abc" },
    })
    expect(result).toEqual({ totalCopies: 3, reservationCount: 2 })
  })

  it("awaits an async auth header callback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validHoldingsBody))

    await buildClient(async () => "Bearer async-token").getMaterialAvailability(["12345678"])

    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual(
      expect.objectContaining({ headers: { authorization: "Bearer async-token" } })
    )
  })

  it("throws on a non-2xx response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 401))

    await expect(buildClient().getMaterialAvailability(["12345678"])).rejects.toThrow(/401/)
  })

  it("throws on a 5xx response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 503))

    await expect(buildClient().getMaterialAvailability(["12345678"])).rejects.toThrow(/503/)
  })

  it("throws when the response shape fails validation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ unexpected: "shape" }))

    await expect(buildClient().getMaterialAvailability(["12345678"])).rejects.toThrow()
  })
})
