// @ts-nocheck
import { add, sub } from "date-fns"
import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "@/app/(routes)/ap-service/[[...slug]]/route"
import * as sessionFunctions from "@/lib/session/session"

vi.mock("@/lib/session/session", async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    getSession: vi.fn(),
    destroySession: vi.fn(),
  }
})

const liveAdgangsplatformenSession = () => ({
  isLoggedIn: true,
  type: "adgangsplatformen",
  expires: add(new Date(), { hours: 1 }),
  adgangsplatformenUserToken: "user-token",
  adgangsplatformenLibraryToken: "library-token",
})

const expiredAdgangsplatformenSession = () => ({
  ...liveAdgangsplatformenSession(),
  expires: sub(new Date(), { minutes: 1 }),
})

const anonymousSessionWithLibraryToken = () => ({
  isLoggedIn: false,
  type: "anonymous",
  adgangsplatformenLibraryToken: "library-token",
})

const mockUpstream = (status: number) => {
  const fetchMock = vi.fn().mockResolvedValue({
    status,
    text: async () => JSON.stringify({}),
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

const requestFbs = () =>
  GET(new NextRequest("http://localhost/ap-service/fbs/external/v1/loans"), {
    params: Promise.resolve({ slug: ["fbs", "external", "v1", "loans"] }),
  })

describe("ap-service proxy session teardown", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("destroys the session when the upstream rejects the user token", async () => {
    vi.mocked(sessionFunctions.getSession).mockResolvedValue(liveAdgangsplatformenSession())
    const fetchMock = mockUpstream(403)

    const response = await requestFbs()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer user-token" }),
      })
    )
    expect(sessionFunctions.destroySession).toHaveBeenCalledTimes(1)
    // The upstream status is passed through untouched.
    expect(response.status).toBe(403)
  })

  it("does not touch the session when the user token is accepted", async () => {
    vi.mocked(sessionFunctions.getSession).mockResolvedValue(liveAdgangsplatformenSession())
    mockUpstream(200)

    await requestFbs()

    expect(sessionFunctions.destroySession).not.toHaveBeenCalled()
  })

  it("does not touch the session when a library-token call is rejected", async () => {
    vi.mocked(sessionFunctions.getSession).mockResolvedValue(anonymousSessionWithLibraryToken())
    const fetchMock = mockUpstream(403)

    await requestFbs()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer library-token" }),
      })
    )
    expect(sessionFunctions.destroySession).not.toHaveBeenCalled()
  })

  // The middleware does not run on this route, so the proxy checks for an
  // expired session itself and never forwards a dead user token.
  it("tears down an expired session and falls back to the library token", async () => {
    vi.mocked(sessionFunctions.getSession).mockResolvedValue(expiredAdgangsplatformenSession())
    const fetchMock = mockUpstream(200)

    await requestFbs()

    expect(sessionFunctions.destroySession).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer library-token" }),
      })
    )
  })
})
