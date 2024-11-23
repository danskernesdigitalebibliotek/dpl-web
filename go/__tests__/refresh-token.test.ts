// @vitest-environment node
import { add } from "date-fns"
import { IronSession, getIronSession } from "iron-session"
import { testApiHandler } from "next-test-api-route-handler"
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest"

// @ts-ignore
import * as tokenRefreshHandler from "@/app/auth/token/refresh/route"
import { TSessionData, accessTokenShouldBeRefreshed } from "@/lib/session/session"

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(),
}))

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://hellboy.the-movie.com")
  const fixedDate = new Date("2024-01-01T00:00:00Z")
  vi.useFakeTimers()
  vi.setSystemTime(fixedDate)
})

afterAll(() => {
  // Restore real timers
  vi.useRealTimers()
})

beforeEach(() => {
  // @ts-ignore
  getIronSession.mockResolvedValue({
    isLoggedIn: true,
  })
})

const sessionThatShouldBeRefreshed = () => ({
  isLoggedIn: true,
  type: "unilogin",
  expires: add(new Date(), { seconds: 59 }),
  refresh_expires: add(new Date(), { seconds: 59 }),
  access_token: "access_token",
  refresh_token: "refresh",
  id_token: "id",
})

// TODO: This should be activated when the refresh token logic is fully implemented.
describe.skip("Refresh token test suite", () => {
  test("That the refresh endpoint redirects to the frontpage if there is no active session", async () => {
    // Simulate an anonymous session.
    // @ts-ignore
    getIronSession.mockResolvedValue({
      isLoggedIn: false,
    })

    await testApiHandler({
      appHandler: tokenRefreshHandler,
      url: `/?redirect=http://john.johnson.com/john`,
      async test({ fetch }) {
        const res = await fetch({ method: "GET" })
        expect(res.headers.get("location")).toEqual("https://hellboy.the-movie.com/")
      },
    })
  })

  test("That the refresh endpoint redirects to the given endpoint after refreshing token", async () => {
    // This is an authorized session that should be refreshed.
    // @ts-ignore
    getIronSession.mockResolvedValue(sessionThatShouldBeRefreshed())

    await testApiHandler({
      appHandler: tokenRefreshHandler,
      url: `/?redirect=http://john.johnson.com/john`,
      async test({ fetch }) {
        const res = await fetch({ method: "GET" })
        expect(res.headers.get("location")).toEqual("http://john.johnson.com/john")
      },
    })

    // This is an authorized session that should NOT be refreshed.
    // @ts-ignore
    getIronSession.mockResolvedValue({
      isLoggedIn: true,
      expires: add(new Date(), { seconds: 300 }),
      refresh_expires: add(new Date(), { seconds: 1800 }),
      access_token: "access_token",
      refresh_token: "refresh",
    })
  })

  // TODO: Write tests that proves that the session object is updated correctly after a successful refresh.

  test("That the refreshValidation validates if the access token should be refreshed correctly", async () => {
    // Since there is a buffer of 1 minute added to the refresh time,
    // the access token should be refreshed 1 minute before it expires.
    expect(
      accessTokenShouldBeRefreshed({
        type: "unilogin",
        expires: add(new Date(), { seconds: 59 }),
        refresh_expires: add(new Date(), { seconds: 59 }),
        isLoggedIn: true,
      } as IronSession<TSessionData>)
    ).toBe(true)

    // Since there is a buffer of 1 minute added to the refresh time,
    // the access token should be refreshed 1 minute before it expires.
    // The tipping point in this case is the 60th second.
    expect(
      accessTokenShouldBeRefreshed({
        type: "unilogin",
        expires: add(new Date(), { seconds: 60 }),
        refresh_expires: add(new Date(), { seconds: 60 }),
        isLoggedIn: true,
      } as IronSession<TSessionData>)
    ).toBe(false)

    // The refresh logic looks at both expires and refresh_expires.
    // Here the expires is the tipping point.
    expect(
      accessTokenShouldBeRefreshed({
        type: "unilogin",
        expires: add(new Date(), { seconds: 59 }),
        refresh_expires: add(new Date(), { seconds: 1800 }),
        isLoggedIn: true,
      } as IronSession<TSessionData>)
    ).toBe(true)
    // Here the refresh_expires is the tipping point.
    expect(
      accessTokenShouldBeRefreshed({
        type: "unilogin",
        expires: add(new Date(), { seconds: 300 }),
        refresh_expires: add(new Date(), { seconds: 59 }),
        isLoggedIn: true,
      } as IronSession<TSessionData>)
    ).toBe(true)
  })
})
