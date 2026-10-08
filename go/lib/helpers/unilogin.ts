import { z } from "zod"

import { getServerEnv } from "../config/env"
import goConfig from "../config/goConfig"
import type { TSessionData } from "../session/session"

// Adgangsplatformen sends the institution ids as one string,
// "[ABC111,CDA222,B4333]", or "" when there are none. Blanks and missing
// brackets are tolerated as well.
const institutionIdsSchema = z.string().transform(ids =>
  ids
    .replace(/[[\]]/g, "")
    .split(",")
    .map(id => id.trim())
    .filter(Boolean)
)

// The Unilogin attributes Adgangsplatformen adds to its userinfo response.
// The claim names must match the CMS (dpl_login Unilogin::CLAIM_*).
const uniloginUserInfoSchema = z.object({
  attributes: z.object({
    uniloginUniId: z.string().min(1),
    uniloginInstitutionIds: institutionIdsSchema,
  }),
})

// DDF's Unilogin test institutions. A user with any of them is a test user,
// as in the CMS (Unilogin::TEST_INSTITUTION_IDS). Publizon does not know them,
// so test users loan through "Christianshavns skole" instead.
// TODO(publizon-sunset): the Biblio adapter authenticates with the token
// alone, so the institution ids and this test-institution mapping go when the
// Publizon API is phased out.
const testInstitutionIds = ["R00263", "A04441"]
const testInstitutionReplacementIds = ["101047"]

// Reads what the local Pubhub adapter needs about a Unilogin user: the uni-id
// is the card number, and loans go through the first institution. Returns
// null when it cannot be read, so no session is created without it. An empty
// institution list does not stop the login: the CMS decides who may log in,
// and a loan without an institution is refused by the Pubhub adapter.
// TODO(publizon-sunset): the uni-id and institution exist for the Publizon
// adapter; the Biblio adapter needs only the token, so revisit what the
// Unilogin session must read once the Publizon API is phased out.
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
      institutionIds: institutionIds.some(id => testInstitutionIds.includes(id))
        ? testInstitutionReplacementIds
        : institutionIds,
    }
  } catch (error) {
    console.error("Could not load Unilogin userinfo", error)
    return null
  }
}
