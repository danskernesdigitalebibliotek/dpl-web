// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET as adgangsplatformenCallback } from "@/app/(routes)/auth/callback/adgangsplatformen/route"
import { GET as cmsLogout } from "@/app/(routes)/auth/logout/cms/route"
import loadAdgangsplatformenLogoutUrl from "@/app/(routes)/auth/logout/loadAdgangsplatformenLogoutUrl"
import { GET as logout } from "@/app/(routes)/auth/logout/route"
import { getBaseURL } from "@/lib/config/getBaseURL"
import goConfig from "@/lib/config/goConfig"
import { getAndClearLoginRedirectUrl } from "@/lib/helpers/login-redirect"
import { loadUserToken } from "@/lib/helpers/user-token"
import * as sessionFunctions from "@/lib/session/session"

import { withSilencedConsole } from "./helpers"

vi.mock("next/server", async importOriginal => ({
  ...(await importOriginal()),
  connection: vi.fn(),
}))

vi.mock("@/lib/session/session", async importOriginal => ({
  ...(await importOriginal()),
  getSession: vi.fn(),
  destroySession: vi.fn(),
  saveSessionFromUserToken: vi.fn(),
}))

vi.mock("@/lib/helpers/user-token", () => ({
  loadUserToken: vi.fn(),
}))

vi.mock("@/lib/helpers/login-redirect", () => ({
  getAndClearLoginRedirectUrl: vi.fn(),
}))

vi.mock("@/app/(routes)/auth/logout/loadAdgangsplatformenLogoutUrl", () => ({
  default: vi.fn(),
}))

const loggedInSession = (type: "adgangsplatformen" | "unilogin") => ({ isLoggedIn: true, type })

const userToken = (type: "adgangsplatformen" | "unilogin") => ({
  status: "token",
  data: { token: "user-token", expire: { timestamp: 1893456000 }, type },
})

describe("/auth/callback/adgangsplatformen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(sessionFunctions.getSession).mockResolvedValue({ isLoggedIn: false })
    vi.mocked(getAndClearLoginRedirectUrl).mockResolvedValue(null)
  })

  it.each([["adgangsplatformen"], ["unilogin"]])(
    "logs in a %s user and sends them to their profile",
    async type => {
      const token = userToken(type)
      vi.mocked(loadUserToken).mockResolvedValue(token)
      vi.mocked(sessionFunctions.saveSessionFromUserToken).mockResolvedValue(true)

      const response = await adgangsplatformenCallback()

      expect(sessionFunctions.saveSessionFromUserToken).toHaveBeenCalledWith(
        expect.anything(),
        token.data
      )
      expect(response.headers.get("location")).toBe(`${getBaseURL()}/user/profile`)
    }
  )

  it("sends a Unilogin user to the Unilogin error page when no session could be created", async () => {
    const { restoreConsole } = withSilencedConsole()
    vi.mocked(loadUserToken).mockResolvedValue(userToken("unilogin"))
    vi.mocked(sessionFunctions.saveSessionFromUserToken).mockResolvedValue(false)

    const response = await adgangsplatformenCallback()

    expect(response.headers.get("location")).toBe(
      `${getBaseURL()}/${goConfig("routes.login-failed-unilogin")}`
    )
    restoreConsole()
  })

  it("sends the user to the Adgangsplatformen error page when the CMS has no token", async () => {
    const { restoreConsole } = withSilencedConsole()
    vi.mocked(loadUserToken).mockResolvedValue({ status: "no-token" })

    const response = await adgangsplatformenCallback()

    expect(sessionFunctions.saveSessionFromUserToken).not.toHaveBeenCalled()
    expect(response.headers.get("location")).toBe(
      `${getBaseURL()}/${goConfig("routes.login-failed-ap")}`
    )
    restoreConsole()
  })
})

// Both session types live on the Drupal session, so both end with it.
describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([["adgangsplatformen"], ["unilogin"]])(
    "destroys a %s session on a CMS-initiated logout",
    async type => {
      const session = loggedInSession(type)
      vi.mocked(sessionFunctions.getSession).mockResolvedValue(session)

      await cmsLogout()

      expect(sessionFunctions.destroySession).toHaveBeenCalledWith(session)
    }
  )

  it.each([["adgangsplatformen"], ["unilogin"]])(
    "logs a %s user out through the CMS logout",
    async type => {
      const session = loggedInSession(type)
      vi.mocked(sessionFunctions.getSession).mockResolvedValue(session)
      vi.mocked(loadAdgangsplatformenLogoutUrl).mockResolvedValue(
        new URL("https://cms.test/logout?current-path=/go-logout")
      )

      const response = await logout()

      expect(sessionFunctions.destroySession).toHaveBeenCalledWith(session)
      expect(response.headers.get("location")).toBe(
        "https://cms.test/logout?current-path=/go-logout"
      )
    }
  )
})
