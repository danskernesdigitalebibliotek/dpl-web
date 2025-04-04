// I do not find it valuable to use time on typing all the mocked functions in the test.
// So we'll ignore the types for the entire test file.
// @ts-nocheck
import { add } from "date-fns"
import * as headersFunctions from "next/headers"
import { NextRequest } from "next/server"
import { describe, it, vi } from "vitest"

import goConfig from "@/lib/config/goConfig"
import * as tokenFunctions from "@/lib/helpers/tokens"
import * as uniloginClientConfigFunctions from "@/lib/session/oauth/uniloginClient"
import * as sessionFunctions from "@/lib/session/session"
import { middleware } from "@/middleware"

vi.mock("next/headers", () => ({
  cookies: () => {
    return {
      getAll: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    }
  },
}))

vi.mock("@/lib/session/oauth/uniloginClient", () => ({
  getUniloginClientConfig: vi.fn(),
}))
vi.mock("iron-session", () => ({
  getIronSession: vi.fn(),
}))
vi.mock("openid-client", () => ({
  discovery: vi.fn(),
}))

vi.mock("@lib/helpers/tokens", () => ({
  loadUserToken: vi.fn(() =>
    Promise.resolve({
      token: "hi-I-am-a-dpl-cms-user-token",
      expire: 363663636,
    })
  ),
  loadLibraryToken: vi.fn(),
}))

vi.mock("@lib/session/fetchSession", () => ({
  getSession: vi.fn(),
}))

vi.mock("@/lib/session/session", async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    defaultSession: {
      isLoggedIn: false,
      type: "anonymous",
      expires: undefined,
      refresh_expires: undefined,
      access_token: undefined,
      refresh_token: undefined,
      id_token: undefined,
      code_verifier: undefined,
      userInfo: undefined,
      adgangsplatformenUserToken: undefined,
    },
    destroySession: vi.fn(),
    getDplCmsSessionCookie: vi.fn(),
    getSession: vi.fn(),
    refreshUniloginTokens: vi.fn(),
    saveAdgangsplatformenSession: vi.fn(),
  }
})

const getFakeSessions = () => {
  const uniloginSessionThatShouldBeRefreshed = {
    isLoggedIn: true,
    type: "unilogin",
    expires: add(new Date(), { seconds: 59 }),
    refresh_expires: add(new Date(), { seconds: 59 }),
    access_token: "access_token",
    refresh_token: "refresh",
    id_token: "id",
  }

  const adgangsplatformenSessionThatDoesNotNeedToBeRefreshed = {
    isLoggedIn: true,
    type: "adgangsplatformen",
    expires: add(new Date(), { days: 1 }),
  }

  const adgangsPlatformenSessionThatShouldBeRefreshed = {
    isLoggedIn: true,
    type: "adgangsplatformen",
    expires: add(new Date(), { seconds: 59 }),
  }

  return {
    adgangsPlatformenSessionThatShouldBeRefreshed,
    uniloginSessionThatShouldBeRefreshed,
    adgangsplatformenSessionThatDoesNotNeedToBeRefreshed,
    anonymousSession: sessionFunctions.defaultSession,
  }
}

const fakeDrupalSessionRequestCookie = {
  name: "SSESSccaeb066c444b6dbb954590b1a54d7c4",
  value: "some-drupal-session-cookie-value",
}

describe("Middleware", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const sessions = getFakeSessions()

  it("can ensure that a library token is present if it is not already", async () => {
    vi.spyOn(tokenFunctions, "loadLibraryToken").mockResolvedValueOnce(
      await Promise.resolve({
        token: "hi-I-am-a-library-token",
        // Unix timestamp
        expire: { timestamp: 999999999 },
      })
    )

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => []),
        get: vi.fn(() => undefined),
      })
    )

    vi.spyOn(sessionFunctions, "getSession").mockResolvedValueOnce(
      Promise.resolve(sessions.anonymousSession)
    )
    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        set: vi.fn(),
        get: vi
          .fn()
          .mockImplementationOnce(() => undefined)
          .mockImplementation(() => ({
            name: goConfig("library-token.cookie-name"),
            value: "hi-I-am-a-library-token",
          })),
      })
    )
    const setLibraryTokenCookieSpy = vi.spyOn(tokenFunctions, "setLibraryTokenCookie")

    await middleware(new NextRequest("http://localhost"))
    expect(setLibraryTokenCookieSpy).toHaveBeenCalledTimes(1)
  })

  it("can destroy an Adgangsplatformen session if it is active and a Drupal session does not exist", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValueOnce(
      Promise.resolve(sessions.adgangsplatformenSessionThatDoesNotNeedToBeRefreshed)
    )
    vi.spyOn(sessionFunctions, "getDplCmsSessionCookie").mockResolvedValue(Promise.resolve())
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())
    await middleware(new NextRequest("http://localhost"))
    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  it("can create an Adgangsplatformen session if it is not already created and a dpl-cms ession exists", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.anonymousSession)
    )
    vi.spyOn(sessionFunctions, "getDplCmsSessionCookie").mockResolvedValue(
      Promise.resolve({
        name: "SSESSccaeb066c444b6dbb954590b1a54d7c4",
        value: "some-drupal-session-cookie-value",
      })
    )

    const saveAdgangsplatformenSessionSpy = vi
      .spyOn(sessionFunctions, "saveAdgangsplatformenSession")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(tokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(new NextRequest("http://localhost"))

    expect(saveAdgangsplatformenSessionSpy).toHaveResolvedTimes(1)
  })

  it("can refresh an Adgangsplatform session if it is expired", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.adgangsPlatformenSessionThatShouldBeRefreshed)
    )

    const saveAdgangsplatformenSessionSpy = vi
      .spyOn(sessionFunctions, "saveAdgangsplatformenSession")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(tokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(new NextRequest("http://localhost"))

    expect(saveAdgangsplatformenSessionSpy).toHaveResolvedTimes(1)
  })

  it("does NOT refresh an Adgangsplatform session if it isn't expired yet", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.adgangsplatformenSessionThatDoesNotNeedToBeRefreshed)
    )

    const saveAdgangsplatformenSessionSpy = vi
      .spyOn(sessionFunctions, "saveAdgangsplatformenSession")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(tokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(new NextRequest("http://localhost"))

    expect(saveAdgangsplatformenSessionSpy).toHaveResolvedTimes(0)
  })

  it("can refresh an Unilogin session if it is expired", async () => {
    vi.spyOn(uniloginClientConfigFunctions, "getUniloginClientConfig").mockResolvedValue(
      Promise.resolve({
        wellknownUrl: "https://unilogin.example.com",
        clientId: "client-id",
      })
    )

    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.uniloginSessionThatShouldBeRefreshed)
    )

    const refreshUniloginTokensSpy = vi
      .spyOn(sessionFunctions, "refreshUniloginTokens")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(tokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(new NextRequest("http://localhost"))

    expect(refreshUniloginTokensSpy).toHaveResolvedTimes(1)
  })

  // it("can destroy an Unilogin session if the access token lifetime has run out", async () => {
  // })

  // it("can destroy an Adgangsplatformen session if the access token lifetime has run out", async () => {
  // })
})
