import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createFbsClient } from "./client"

const baseUrl = "https://fbs.example"
const patronInfoUrl = `${baseUrl}/external/agencyid/patrons/patronid/v4`

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
