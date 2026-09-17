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

const requestFbs = (authHeader?: string) => {
  const request = new NextRequest("http://localhost/ap-service/fbs/external/v1/loans")
  if (authHeader) {
    request.headers.set("Authorization", authHeader)
  }
  return GET(request, {
    params: Promise.resolve({ slug: ["fbs", "external", "v1", "loans"] }),
  })
}

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

  // Every FBS call from the browser carries an Authorization header, because
  // the client was handed the token by getServiceLayerAuthHeader. Treating it
  // as an opaque pass-through would hide the one signal that tells us the
  // session is over.
  it("destroys the session when the upstream rejects the session's own token sent as a header", async () => {
    vi.mocked(sessionFunctions.getSession).mockResolvedValue(liveAdgangsplatformenSession())
    mockUpstream(403)

    await requestFbs("Bearer user-token")

    expect(sessionFunctions.destroySession).toHaveBeenCalledTimes(1)
  })

  it("does not touch the session when a header carrying someone else's token is rejected", async () => {
    vi.mocked(sessionFunctions.getSession).mockResolvedValue(liveAdgangsplatformenSession())
    const fetchMock = mockUpstream(403)

    await requestFbs("Bearer some-other-token")

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer some-other-token" }),
      })
    )
    expect(sessionFunctions.destroySession).not.toHaveBeenCalled()
  })

  // The client keeps sending the token it was given, so it will hand us a
  // dead one after the session expires. We must not spend a call on it.
  it("does not forward an expired user token that arrives as a header", async () => {
    vi.mocked(sessionFunctions.getSession).mockResolvedValue(expiredAdgangsplatformenSession())
    const fetchMock = mockUpstream(200)

    await requestFbs("Bearer user-token")

    expect(sessionFunctions.destroySession).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer library-token" }),
      })
    )
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
