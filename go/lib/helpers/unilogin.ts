import { z } from "zod"

import { getServerEnv } from "../config/env"
import goConfig from "../config/goConfig"
import type { TSessionData } from "../session/session"

// Adgangsplatformen sends the institution ids as one string,
// "[ABC111,CDA222,B4333]", or "" when there are none. Blanks, missing
// brackets and an array are tolerated as well.
const institutionIdsSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(ids => (typeof ids === "string" ? ids.replace(/[[\]]/g, "").split(",") : ids))
  .transform(ids => ids.map(id => id.trim()).filter(Boolean))

// The Unilogin attributes Adgangsplatformen adds to its userinfo response.
// The claim names must match the CMS (dpl_login Unilogin::CLAIM_*).
const uniloginUserInfoSchema = z.object({
  attributes: z.object({
    uniloginUniId: z.string().min(1),
    uniloginInstitutionIds: institutionIdsSchema,
  }),
})

// R00263 is DDF's Unilogin test institution. Publizon does not know it, so
// test users loan through "Christianshavns skole" instead.
const testInstitutionId = "R00263"
const testInstitutionReplacementIds = ["101047"]

// Reads what the local Pubhub adapter needs about a Unilogin user: the uni-id
// is the card number, and loans go through the first institution. Returns
// null when it cannot be read, so no session is created without it. An empty
// institution list does not stop the login: the CMS decides who may log in,
// and a loan without an institution is refused by the Pubhub adapter.
export const loadUniloginUserInfo = async (
  userToken: string
): Promise<TSessionData["uniLoginUserInfo"] | null> => {
  const userinfoUrl =
    getServerEnv("ADGANGSPLATFORMEN_USERINFO_URL") ??
    goConfig("auth.adgangsplatformen-userinfo-url")

  try {
    const response = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${userToken}` },
      cache: "no-store",
    })
    if (!response.ok) {
      console.error(`Could not load Unilogin userinfo: ${response.status}`)
      return null
    }

    const result = uniloginUserInfoSchema.safeParse(await response.json())
    if (!result.success) {
      console.error("Unexpected Unilogin userinfo", result.error.flatten())
      return null
    }

    const { uniloginUniId: uniid, uniloginInstitutionIds: institutionIds } = result.data.attributes
    return {
      uniid,
      institutionIds:
        institutionIds[0] === testInstitutionId ? testInstitutionReplacementIds : institutionIds,
    }
  } catch (error) {
    console.error("Could not load Unilogin userinfo", error)
    return null
  }
}
