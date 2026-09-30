// I do not find it valuable to use time on typing all the mocked functions in the test.
// So we'll ignore the types for the entire test file.
// @ts-nocheck
import { add, sub } from "date-fns"
import * as headersFunctions from "next/headers"
import { NextRequest } from "next/server"
import { describe, it, vi } from "vitest"

import goConfig from "@/lib/config/goConfig"
import * as libraryTokenFunctions from "@/lib/helpers/library-token"
import * as userTokenFunctions from "@/lib/helpers/user-token"
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

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(),
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
vi.mock("@/lib/session/session", async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    defaultSession: {
      isLoggedIn: false,
      type: "anonymous",
      expires: undefined,
      userInfo: undefined,
      adgangsplatformenUserToken: undefined,
    },
    destroySession: vi.fn(),
    getDplCmsSessionCookie: vi.fn(),
    markSessionValidated: vi.fn(),
    getSession: vi.fn(),
    saveSessionFromUserToken: vi.fn(),
  }
})

const getFakeSessions = () => {
  const liveUniloginSession = {
    isLoggedIn: true,
    type: "unilogin",
    expires: add(new Date(), { days: 1 }),
    uniLoginUserInfo: { uniid: "uniid", institutionIds: ["101047"] },
    save: vi.fn(),
  }

  const expiredUniloginSession = {
    ...liveUniloginSession,
    expires: sub(new Date(), { minutes: 1 }),
  }

  const adgangsplatformenSessionThatDoesNotNeedToBeRefreshed = {
    isLoggedIn: true,
    type: "adgangsplatformen",
    expires: add(new Date(), { days: 1 }),
    save: vi.fn(),
  }

  const adgangsplatformenSessionCloseToExpiry = {
    isLoggedIn: true,
    type: "adgangsplatformen",
    expires: add(new Date(), { seconds: 59 }),
    save: vi.fn(),
  }

  const adgangsPlatformenSessionThatIsTooOld = {
    isLoggedIn: true,
    type: "adgangsplatformen",
    expires: sub(new Date(), { minutes: 1 }),
  }

  return {
    adgangsplatformenSessionCloseToExpiry,
    liveUniloginSession,
    expiredUniloginSession,
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
    // No Drupal session cookie in this scenario, so the CMS has no token for
    // us — the same answer loadUserToken gives without calling out at all.
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({ status: "no-token" as const })
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

    const saveSessionFromUserTokenSpy = vi
      .spyOn(sessionFunctions, "saveSessionFromUserToken")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        status: "token" as const,
        data: {
          token: "hi-I-am-a-dpl-cms-user-token",
          expire: { timestamp: 363663636 },
          type: "adgangsplatformen",
        },
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(saveSessionFromUserTokenSpy).toHaveResolvedTimes(1)
  })

  // The GO session lives exactly as long as the user token — the CMS cannot
  // renew it, so there is no refresh path for Adgangsplatformen sessions.
  it("does NOT extend an Adgangsplatformen session that is close to expiry", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.adgangsplatformenSessionCloseToExpiry)
    )

    const saveSessionFromUserTokenSpy = vi
      .spyOn(sessionFunctions, "saveSessionFromUserToken")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        status: "token" as const,
        data: {
          token: "hi-I-am-a-dpl-cms-user-token",
          expire: { timestamp: 363663636 },
          type: "adgangsplatformen",
        },
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(saveSessionFromUserTokenSpy).toHaveResolvedTimes(0)
  })

  it("does NOT refresh an Adgangsplatform session if it isn't expired yet", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.adgangsplatformenSessionThatDoesNotNeedToBeRefreshed)
    )

    const saveSessionFromUserTokenSpy = vi
      .spyOn(sessionFunctions, "saveSessionFromUserToken")
      .mockResolvedValue(Promise.resolve())

    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      await Promise.resolve({
        status: "token" as const,
        data: {
          token: "hi-I-am-a-dpl-cms-user-token",
          expire: { timestamp: 363663636 },
          type: "adgangsplatformen",
        },
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(saveSessionFromUserTokenSpy).toHaveResolvedTimes(0)
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
        status: "token" as const,
        data: {
          token: "hi-I-am-a-dpl-cms-user-token",
          expire: { timestamp: 363663636 },
          type: "adgangsplatformen",
        },
      })
    )

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  // Drupal can retire the session while the token is still accepted by the
  // services, so the CMS is the only party that knows it is over.
  const setUpLoggedInRevalidation = (
    tokenResult: unknown,
    validatedAt?: Date,
    session = sessions.adgangsplatformenSessionThatDoesNotNeedToBeRefreshed
  ) => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve({
        ...session,
        validatedAt,
        save: vi.fn(),
      })
    )
    vi.spyOn(sessionFunctions, "getDplCmsSessionCookie").mockResolvedValue(
      Promise.resolve(fakeDrupalSessionRequestCookie)
    )
    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(Promise.resolve(tokenResult))

    return getNextRequestWithLibraryTokenCookie()
  }

  it("destroys a logged in Adgangsplatformen session when the CMS has no token for it", async () => {
    const request = setUpLoggedInRevalidation({ status: "no-token" })
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    await middleware(request)

    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  it("keeps a logged in Adgangsplatformen session when the CMS cannot be reached", async () => {
    const request = setUpLoggedInRevalidation({ status: "error" })
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    await middleware(request)

    expect(destroySessionSpy).toHaveBeenCalledTimes(0)
  })

  // Asking on every request would put a CMS round trip in front of every page
  // load and every prefetch.
  it("does not ask the CMS again within the validation window", async () => {
    const request = setUpLoggedInRevalidation(
      { status: "no-token" },
      sub(new Date(), { seconds: 5 })
    )
    const loadUserTokenSpy = vi.spyOn(userTokenFunctions, "loadUserToken")

    await middleware(request)

    expect(loadUserTokenSpy).toHaveBeenCalledTimes(0)
  })

  it("asks the CMS again once the validation window has passed", async () => {
    const request = setUpLoggedInRevalidation(
      { status: "no-token" },
      sub(new Date(), { seconds: 31 })
    )
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    await middleware(request)

    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  const tokenOfType = (type: string) => ({
    status: "token" as const,
    data: {
      token: "hi-I-am-a-dpl-cms-user-token",
      expire: { timestamp: 363663636 },
      type,
    },
  })

  // A Unilogin login runs through the CMS as well, so the anonymous
  // auto-login must pick the session type from the token, not assume a patron.
  it("creates a session from a Unilogin token handed out by the CMS", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.anonymousSession)
    )
    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    const token = tokenOfType("unilogin")
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(Promise.resolve(token))
    const saveSessionFromUserTokenSpy = vi
      .spyOn(sessionFunctions, "saveSessionFromUserToken")
      .mockResolvedValue(Promise.resolve(true))

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(saveSessionFromUserTokenSpy).toHaveBeenCalledWith(sessions.anonymousSession, token.data)
  })

  // The userinfo lookup can fail. The visitor then simply stays anonymous.
  it("lets the request continue anonymously when no session could be created", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.anonymousSession)
    )
    vi.spyOn(headersFunctions, "cookies").mockResolvedValue(
      Promise.resolve({
        getAll: vi.fn(() => [fakeDrupalSessionRequestCookie]),
        get: vi.fn(() => fakeDrupalSessionRequestCookie),
      })
    )
    vi.spyOn(userTokenFunctions, "loadUserToken").mockResolvedValue(
      Promise.resolve(tokenOfType("unilogin"))
    )
    vi.spyOn(sessionFunctions, "saveSessionFromUserToken").mockResolvedValue(Promise.resolve(false))
    const destroySessionSpy = vi.spyOn(sessionFunctions, "destroySession")

    const response = await middleware(getNextRequestWithLibraryTokenCookie())

    expect(response.status).toBe(200)
    expect(destroySessionSpy).toHaveBeenCalledTimes(0)
  })

  // Unilogin sessions are tied to the Drupal session just like
  // Adgangsplatformen sessions (ADR-013).
  it("can destroy a Unilogin session if it is active and a Drupal session does not exist", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValueOnce(
      Promise.resolve(sessions.liveUniloginSession)
    )
    vi.spyOn(sessionFunctions, "getDplCmsSessionCookie").mockResolvedValue(Promise.resolve())
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  it("can destroy a Unilogin session if the token lifetime has run out", async () => {
    vi.spyOn(sessionFunctions, "getDplCmsSessionCookie").mockResolvedValue(
      Promise.resolve(fakeDrupalSessionRequestCookie)
    )
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      Promise.resolve(sessions.expiredUniloginSession)
    )
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    await middleware(getNextRequestWithLibraryTokenCookie())

    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  it("destroys a logged in Unilogin session when the CMS has no token for it", async () => {
    const request = setUpLoggedInRevalidation(
      { status: "no-token" },
      undefined,
      sessions.liveUniloginSession
    )
    const destroySessionSpy = vi
      .spyOn(sessionFunctions, "destroySession")
      .mockResolvedValue(Promise.resolve())

    await middleware(request)

    expect(destroySessionSpy).toHaveResolvedTimes(1)
  })

  it.each([
    ["unilogin", "adgangsplatformen"],
    ["adgangsplatformen", "unilogin"],
  ])(
    "keeps a logged in %s session when the CMS hands out a token of the same type",
    async sessionType => {
      const session =
        sessionType === "unilogin"
          ? sessions.liveUniloginSession
          : sessions.adgangsplatformenSessionThatDoesNotNeedToBeRefreshed
      const request = setUpLoggedInRevalidation(tokenOfType(sessionType), undefined, session)
      const destroySessionSpy = vi.spyOn(sessionFunctions, "destroySession")
      const markSessionValidatedSpy = vi.spyOn(sessionFunctions, "markSessionValidated")

      await middleware(request)

      expect(destroySessionSpy).toHaveBeenCalledTimes(0)
      expect(markSessionValidatedSpy).toHaveBeenCalledTimes(1)
    }
  )

  // Somebody else logged in on the CMS in the same browser, e.g. a parent
  // after a student. The GO session must not live on with the new token.
  it.each([
    ["unilogin", "adgangsplatformen"],
    ["adgangsplatformen", "unilogin"],
  ])(
    "destroys a logged in %s session when the CMS hands out a %s token",
    async (sessionType, tokenType) => {
      const session =
        sessionType === "unilogin"
          ? sessions.liveUniloginSession
          : sessions.adgangsplatformenSessionThatDoesNotNeedToBeRefreshed
      const request = setUpLoggedInRevalidation(tokenOfType(tokenType), undefined, session)
      const destroySessionSpy = vi
        .spyOn(sessionFunctions, "destroySession")
        .mockResolvedValue(Promise.resolve())

      await middleware(request)

      expect(destroySessionSpy).toHaveResolvedTimes(1)
    }
  )
})
