import { z } from "zod"

const regexInt = /^\d+$/
const schemas = {
  tokenSet: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    id_token: z.string(),
    expires_in: z.number(),
    refresh_expires_in: z.number(),
  }),
  introspect: z.object({
    uniid: z.string(),
    institution_ids: z.string(),
  }),
  uniLoginUserInfo: z.object({
    sub: z.string(),
  }),
  institution: z.object({
    instnr: z.string().regex(/^[A-Z0-9]+$/),
    instnavn: z.string(),
    type: z.string().regex(/^[A-Z0-9]+$/),
    typenavn: z.string().optional(),
    type3: z.string().optional(),
    type3navn: z.string().optional(),
    adresse: z.string().optional(),
    bynavn: z.string().optional(),
    postnr: z.string().regex(regexInt).optional(),
    telefonnr: z.string().optional(),
    mailadresse: z.string().optional(),
    www: z.string().optional(),
    // @todo: We would like to have komunnenr to be required.
    // Go is investigating if we can get a municipality attached to the fake institution .
    kommunenr: z.string().optional(),
    kommune: z.string().optional(),
    admkommunenr: z.string().regex(regexInt).optional(),
    admkommune: z.string().optional(),
    regionsnr: z.string().regex(regexInt).optional(),
    region: z.string().optional(),
  }),
}

export default schemas
