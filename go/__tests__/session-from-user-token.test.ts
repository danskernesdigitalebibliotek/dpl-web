// @ts-nocheck
import { getPatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import * as headersFunctions from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { uniLoginUserInfoSchema } from "@/app/(routes)/pubhub/(lib)/schemas"
import goConfig from "@/lib/config/goConfig"
import {
  getPatronUserToken,
  migrateLegacySession,
  saveSessionFromUserToken,
} from "@/lib/session/session"

import { withSilencedConsole } from "./helpers"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("@danskernesdigitalebibliotek/dpl-service-layer", () => ({
  getPatron: vi.fn(),
}))

const userinfoUrl = "https://login.bib.test/userinfo/"
const expireTimestamp = 1893456000

const userToken = (type: "adgangsplatformen" | "unilogin") => ({
  token: "user-token",
  expire: { timestamp: expireTimestamp },
  type,
})

const newSession = () => ({ isLoggedIn: false, type: "anonymous", save: vi.fn() })

// The shape of a real Adgangsplatformen userinfo response for a Unilogin
// login. Institution ids come as one string: "[ABC111,CDA222]", or "".
const uniloginUserinfo = (institutionIds: unknown) => ({
  attributes: {
    cpr: null,
    userId: "user-id",
    idpUsed: "unilogin_oidc",
    agencies: [],
    municipality: null,
    uniloginUniId: "100006cbab",
    uniloginUserType: "Elev",
    uniloginUniIdHash: "uni-id-hash",
    uniloginHasLicense: true,
    municipalityAgencyId: null,
    uniloginInstitutionIds: institutionIds,
    uniloginMunicipality: null,
    uniloginAgencyId: null,
    loggedInAgencyId: "190101",
  },
})

const mockUserinfo = (response: { ok: boolean; body?: unknown }) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.ok ? 200 : 401,
    json: async () => response.body,
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("saveSessionFromUserToken", () => {
  let cookieSet: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    vi.stubEnv("ADGANGSPLATFORMEN_USERINFO_URL", userinfoUrl)
    cookieSet = vi.fn()
    vi.mocked(headersFunctions.cookies).mockResolvedValue({ set: cookieSet })
  })

  it("saves an Adgangsplatformen session for a patron token", async () => {
    vi.mocked(getPatron).mockResolvedValue({ name: "Firstname Lastname" })
    const session = newSession()

    expect(await saveSessionFromUserToken(session, userToken("adgangsplatformen"))).toBe(true)

    expect(session).toMatchObject({
      isLoggedIn: true,
      type: "adgangsplatformen",
      userToken: "user-token",
      expires: new Date(expireTimestamp * 1000),
      user: { name: "Firstname Lastname" },
    })
    expect(getPatronUserToken(session)).toBe("user-token")
    expect(session.save).toHaveBeenCalledTimes(1)
    expect(cookieSet).toHaveBeenCalledWith(
      goConfig("auth.cookie-names.session-type"),
      "adgangsplatformen",
      expect.anything()
    )
  })

  it("saves a Unilogin session with the userinfo the Pubhub adapter needs", async () => {
    const fetchMock = mockUserinfo({ ok: true, body: uniloginUserinfo("[ABC111,CDA222,B4333]") })
    const session = newSession()

    expect(await saveSessionFromUserToken(session, userToken("unilogin"))).toBe(true)

    expect(fetchMock).toHaveBeenCalledWith(
      userinfoUrl,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer user-token" }),
      })
    )
    // The same shape the STIL flow stored: the uni-id is the Pubhub card
    // number and the first institution id is sent to Publizon.
    expect(session.uniLoginUserInfo).toEqual({
      uniid: "100006cbab",
      institutionIds: ["ABC111", "CDA222", "B4333"],
    })
    expect(uniLoginUserInfoSchema.parse(session.uniLoginUserInfo)).toEqual(session.uniLoginUserInfo)
    expect(session).toMatchObject({
      isLoggedIn: true,
      type: "unilogin",
      expires: new Date(expireTimestamp * 1000),
      user: { name: undefined, username: "100006cbab" },
    })
    // The student's token is kept, but must never be forwarded to FBS/FBI as
    // a user token.
    expect(session.userToken).toBe("user-token")
    expect(getPatronUserToken(session)).toBeUndefined()
    expect(getPatron).not.toHaveBeenCalled()
    expect(session.save).toHaveBeenCalledTimes(1)
    expect(cookieSet).toHaveBeenCalledWith(
      goConfig("auth.cookie-names.session-type"),
      "unilogin",
      expect.anything()
    )
  })

  // Publizon does not know DDF's test institutions, so test users loan
  // through "Christianshavns skole".
  it.each([["[R00263,ABC111]"], ["[ABC111,R00263]"], ["[A04441,R00263]"], ["[A04441]"]])(
    "maps the DDF test institutions in %s to an institution known by Publizon",
    async institutionIds => {
      mockUserinfo({ ok: true, body: uniloginUserinfo(institutionIds) })
      const session = newSession()

      await saveSessionFromUserToken(session, userToken("unilogin"))

      expect(session.uniLoginUserInfo.institutionIds).toEqual(["101047"])
    }
  )

  it.each([
    ["a bracketed list", "[ABC111,CDA222,B4333]", ["ABC111", "CDA222", "B4333"]],
    ["a single bracketed id", "[ABC111]", ["ABC111"]],
    ["a list without brackets", "ABC111", ["ABC111"]],
    ["a list with blanks", " A1234 ,, B5678 ", ["A1234", "B5678"]],
    // The CMS decides whether the student may log in. Without an institution
    // loans fail later, but the login does not.
    ["an empty string", "", []],
  ])("reads institution ids given as %s", async (_case, institutionIds, expected) => {
    mockUserinfo({ ok: true, body: uniloginUserinfo(institutionIds) })
    const session = newSession()

    expect(await saveSessionFromUserToken(session, userToken("unilogin"))).toBe(true)

    expect(session.uniLoginUserInfo.institutionIds).toEqual(expected)
    expect(uniLoginUserInfoSchema.parse(session.uniLoginUserInfo)).toEqual(session.uniLoginUserInfo)
  })

  it.each([
    ["the userinfo request is refused", { ok: false }],
    ["the userinfo lacks the Unilogin attributes", { ok: true, body: { attributes: {} } }],
  ])("does not save a Unilogin session when %s", async (_case, response) => {
    const { restoreConsole } = withSilencedConsole()
    mockUserinfo(response)
    const session = newSession()

    expect(await saveSessionFromUserToken(session, userToken("unilogin"))).toBe(false)

    expect(session.isLoggedIn).toBe(false)
    expect(session.save).not.toHaveBeenCalled()
    expect(cookieSet).not.toHaveBeenCalled()
    restoreConsole()
  })

  it("does not save a Unilogin session when the userinfo endpoint cannot be reached", async () => {
    const { restoreConsole } = withSilencedConsole()
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))
    const session = newSession()

    expect(await saveSessionFromUserToken(session, userToken("unilogin"))).toBe(false)
    expect(session.save).not.toHaveBeenCalled()
    restoreConsole()
  })
})

describe("migrateLegacySession", () => {
  // Sessions created before userToken replaced adgangsplatformenUserToken
  // live on in the browser for up to a week.
  it("moves a patron token from the old field to userToken", () => {
    const session = {
      isLoggedIn: true,
      type: "adgangsplatformen",
      adgangsplatformenUserToken: "user-token",
    }

    migrateLegacySession(session)

    expect(session).toEqual({
      isLoggedIn: true,
      type: "adgangsplatformen",
      userToken: "user-token",
    })
  })

  it("leaves a current session alone", () => {
    const session = { isLoggedIn: true, type: "unilogin", userToken: "student-token" }

    migrateLegacySession(session)

    expect(session).toEqual({ isLoggedIn: true, type: "unilogin", userToken: "student-token" })
  })
})
