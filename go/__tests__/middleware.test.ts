// I do not find it valuable to use time on typing all the mocked functions in the test.
// So we'll ignore the types for the entire test file.
// @ts-nocheck
import { add, sub } from "date-fns"
import * as headersFunctions from "next/headers"
import { NextRequest } from "next/server"
import * as client from "openid-client"
import { describe, it, vi } from "vitest"

import goConfig from "@/lib/config/goConfig"
import * as bearerTokenFunctions from "@/lib/helpers/bearer-token"
import * as libraryTokenFunctions from "@/lib/helpers/library-token"
import * as userTokenFunctions from "@/lib/helpers/user-token"
import * as uniloginClientConfigFunctions from "@/lib/session/oauth/uniloginClient"
import * as sessionFunctions from "@/lib/session/session"
import { proxy as middleware } from "@/proxy"

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

vi.mock("@lib/helpers/library-token", () => ({
  loadLibraryToken: vi.fn(),
}))
vi.mock("@lib/helpers/user-token", () => ({
  loadUserToken: vi.fn(),
}))

vi.mock("@lib/session/fetchSession", () => ({
  getSession: vi.fn(),
}))
vi.mock("openid-client", () => ({
  refreshTokenGrant: vi.fn(),
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
    saveAdgangsplatformenSession: vi.fn(),
    removePCKECodeVerifierFromSession: vi.fn(),
    sessionHasPKCECodeVerifier: vi.fn(),
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
  const uniloginSessionWithExpiredRefreshToken = {
    isLoggedIn: true,
    type: "unilogin",
    expires: sub(new Date(), { minute: 2 }),
    refresh_expires: sub(new Date(), { minute: 1 }),
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

  const adgangsPlatformenSessionThatIsTooOld = {
    isLoggedIn: true,
    type: "adgangsplatformen",
    expires: sub(new Date(), { minutes: 1 }),
    refresh_expires: sub(new Date(), { minutes: 1 }),
  }

  return {
    adgangsPlatformenSessionThatShouldBeRefreshed,
    uniloginSessionThatShouldBeRefreshed,
    uniloginSessionWithExpiredRefreshToken,
    adgangsplatformenSessionThatDoesNotNeedToBeRefreshed,
    adgangsPlatformenSessionThatIsTooOld,
    anonymousSession: sessionFunctions.defaultSession,
  }
}

const fakeDrupalSessionRequestCookie = {
  name: "SSESSccaeb066c444b6dbb954590b1a54d7c4",
  value: "some-drupal-session-cookie-value",
}

const getNextRequestWithLibraryTokenCookie = () => {
  const request = new NextRequest("http://localhost")
  request.cookies.set(goConfig("library-token.cookie-name"), "hi-I-am-a-library-token")
  return request
}

describe("Middleware", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const sessions = getFakeSessions()

  it("can ensure that a library token is present if it is not already", async () => {
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )
    vi.spyOn(libraryTokenFunctions, "loadLibraryToken").mockResolvedValueOnce(
      await Promise.resolve({
        token: "hi-I-am-a-library-token",
        // Unix timestamp
        expire: { timestamp: 999999999 },
      })
    )
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValueOnce(
      Promise.resolve(sessions.anonymousSession)
    )
    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => []),
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
    const setLibraryTokenCookieSpy = vi.spyOn(libraryTokenFunctions, "setLibraryTokenCookie")

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
    await middleware(getNextRequestWithLibraryTokenCookie())
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
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

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
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

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
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(saveAdgangsplatformenSessionSpy).toHaveResolvedTimes(0)
  })

  it("can refresh a Unilogin session if it is expired", async () => {
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
      .spyOn(bearerTokenFunctions, "refreshUniloginTokens")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(refreshUniloginTokensSpy).toHaveResolvedTimes(1)
  })

  // @todo Would be nice to have this test as well.
  // Ran intro problems with that it only fails when it is running together with the other tests.
  it("can destroy a Unilogin session if the refresh time is overdue", async () => {
    // Note: The refresh endpoint is typically failing because the refresh lifespan has run out.
    // But it can also fail for abritraty reasons - eg. server down.
    vi.unmock("@/lib/session/session")
    vi.doMock("@/lib/session/session", async importOriginal => {
      const actual = await importOriginal()
      return {
        ...actual,
        destroySession: vi.fn(),
        getSession: vi.fn(),
      }
    })

    vi.spyOn(uniloginClientConfigFunctions, "getUniloginClientConfig").mockResolvedValue(
      Promise.resolve({
        wellknownUrl: "https://unilogin.example.com",
        clientId: "client-id",
      })
    )

    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve({ ...sessions.uniloginSessionWithExpiredRefreshToken, destroy: vi.fn() })
    )

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(destroySessionSpy).toHaveBeenCalledTimes(1)
  })

  it("can destroy an Adgangsplatformen session if the access token lifetime has run out", async () => {
    vi.spyOn(sessionFunctions, "getDplCmsSessionCookie").mockResolvedValue(
      Promise.resolve({
        name: "SSESSccaeb066c444b6dbb954590b1a54d7c4",
        value: "some-drupal-session-cookie-value",
      })
    )

    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.adgangsPlatformenSessionThatIsTooOld)
    )

    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        token: "hi-I-am-a-dpl-cms-user-token",
        expire: 363663636,
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  it("removes PKCE code verifier from session if it exists", async () => {
    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => []),
      })
    )

    // Create a session with a code_verifier
    const sessionWithCodeVerifier = {
      ...sessions.anonymousSession,
      code_verifier: "test-pkce-code-verifier",
      save: vi.fn(),
    }

    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessionWithCodeVerifier)
    )

    const removePCKECodeVerifierSpy = vi.spyOn(
      sessionFunctions,
      "removePCKECodeVerifierFromSession"
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    // Verify that the function was called with the session
    expect(removePCKECodeVerifierSpy).toHaveBeenCalledTimes(1)
    expect(removePCKECodeVerifierSpy).toHaveBeenCalledWith(sessionWithCodeVerifier)
  })

  it("does not attempt to remove PKCE code verifier if it doesn't exist in session", async () => {
    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => []),
      })
    )

    // Create a session without a code_verifier
    const sessionWithoutCodeVerifier = {
      ...sessions.anonymousSession,
      save: vi.fn(),
    }

    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessionWithoutCodeVerifier)
    )

    const removePCKECodeVerifierSpy = vi.spyOn(
      sessionFunctions,
      "removePCKECodeVerifierFromSession"
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    // Verify that the removal function was NOT called since there's no code_verifier
    expect(removePCKECodeVerifierSpy).toHaveBeenCalledTimes(0)
  })
})
