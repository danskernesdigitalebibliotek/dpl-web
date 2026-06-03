import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createFbsClient } from "./client"

const baseUrl = "https://fbs.example"
const patronInfoUrl = `${baseUrl}/external/agencyid/patrons/patronid/v4`
const availabilityUrl = `${baseUrl}/external/agencyid/catalog/availability/v3`

const mockJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  }) as Response

const validPatronBody = {
  authenticateStatus: "VALID",
  patron: { name: "Test User" },
}

const validAvailabilityBody = [
  { available: true, recordId: "12345678", reservable: true, reservations: 1 },
  { available: false, recordId: "23456789", reservable: false, reservations: 0 },
]

const buildClient = (
  getAuthHeader: () => Promise<string | null> | string | null = () => "Bearer abc"
) => createFbsClient({ baseUrl, getAuthHeader })

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

  it("omits the Authorization header when getAuthHeader returns null", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validPatronBody))

    await buildClient(() => null).getPatron()

    expect(fetch).toHaveBeenCalledWith(patronInfoUrl, {
      method: "GET",
      headers: {},
    })
  })

  it("throws fast when getAuthHeader returns an empty string", async () => {
    await expect(buildClient(() => "").getPatron()).rejects.toThrow(/empty string/)
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe("createFbsClient.getAvailability", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("calls the availability endpoint with each faustId as a recordid query param and returns mapped DTOs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validAvailabilityBody))

    const result = await buildClient().getAvailability({
      faustIds: ["12345678", "23456789"],
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(typeof calledUrl).toBe("string")
    const parsed = new URL(calledUrl as string)
    expect(`${parsed.origin}${parsed.pathname}`).toBe(availabilityUrl)
    expect(parsed.searchParams.getAll("recordid")).toEqual(["12345678", "23456789"])
    expect(parsed.searchParams.getAll("exclude")).toEqual([])
    expect(calledInit).toEqual({
      method: "GET",
      headers: { authorization: "Bearer abc" },
    })

    expect(result).toEqual([
      { faustId: "12345678", isAvailable: true, isReservable: true, reservationCount: 1 },
      { faustId: "23456789", isAvailable: false, isReservable: false, reservationCount: 0 },
    ])
  })

  it("appends every excludeBranches entry as an exclude query param", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validAvailabilityBody))

    await buildClient().getAvailability({
      faustIds: ["12345678"],
      excludeBranches: ["775100", "775120"],
    })

    const [calledUrl] = vi.mocked(fetch).mock.calls[0]
    const parsed = new URL(calledUrl as string)
    expect(parsed.searchParams.getAll("exclude")).toEqual(["775100", "775120"])
  })

  it("returns an empty array and does not call fetch when faustIds is empty", async () => {
    const result = await buildClient().getAvailability({ faustIds: [] })

    expect(fetch).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it("awaits an async auth header callback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validAvailabilityBody))

    await buildClient(async () => "Bearer async-token").getAvailability({
      faustIds: ["12345678"],
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { authorization: "Bearer async-token" },
      })
    )
  })

  it("throws on a non-2xx response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 401))

    await expect(buildClient().getAvailability({ faustIds: ["12345678"] })).rejects.toThrow(/401/)
  })

  it("throws when the response shape fails validation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse([{ wrong: "shape" }]))

    await expect(buildClient().getAvailability({ faustIds: ["12345678"] })).rejects.toThrow()
  })

  it("omits the Authorization header when getAuthHeader returns null", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(validAvailabilityBody))

    await buildClient(() => null).getAvailability({ faustIds: ["12345678"] })

    const [, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledInit).toEqual({ method: "GET", headers: {} })
  })

  it("throws fast when getAuthHeader returns an empty string", async () => {
    await expect(buildClient(() => "").getAvailability({ faustIds: ["12345678"] })).rejects.toThrow(
      /empty string/
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
