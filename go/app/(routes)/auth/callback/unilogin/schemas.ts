import { z } from "zod"

const schemas = {
  tokenSet: z.object({
    access_token: z.string(),
    expires_in: z.number(),
    refresh_token: z.string().optional(),
    refresh_expires_in: z.number().optional(),
    id_token: z.string().optional(),
  }),
  // Userinfo response from the Adgangsplatformen adapter for unilogin_oidc logins.
  userinfo: z.object({
    attributes: z.object({
      uniloginUniId: z.string(),
      uniloginHasLicense: z
        .union([z.boolean(), z.enum(["true", "false"])])
        .transform(value => value === true || value === "true"),
      uniloginInstitutionIds: z.array(z.string()),
      municipalityAgencyId: z.string().nullish(),
      uniloginAgencyId: z.string().nullish(),
      uniloginUserType: z.string().nullish(),
      uniloginUniIdHash: z.string().nullish(),
    }),
  }),
}

export type TUniloginUserinfoAttributes = z.output<typeof schemas.userinfo>["attributes"]

export default schemas
