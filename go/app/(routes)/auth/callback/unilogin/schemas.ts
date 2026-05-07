import { z } from "zod"

const schemas = {
  tokenSet: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    id_token: z.string(),
    expires_in: z.number(),
    refresh_expires_in: z.number(),
  }),
  institution: z.object({
    INST_NR: z.string(),
    INST_NAVN: z.string(),
    INST_TYPE: z.string().optional(),
    ADRESSE: z.string().optional(),
    BYNAVN: z.string().optional(),
    POST_NR: z.number().optional(),
    TELEFON_NR: z.string().optional(),
    MAIL_ADRESSE: z.string().optional(),
    WWW: z.string().optional(),
    KOMMUNE_NR: z.number().optional(),
    KOMMUNE: z.string().optional(),
    REGION_NR: z.number().optional(),
    REGION: z.string().optional(),
  }),
}

export default schemas
