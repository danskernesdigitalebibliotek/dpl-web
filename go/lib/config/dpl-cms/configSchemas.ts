import { z } from "zod"

export const publicConfigSchema = z.object({
  loginUrls: z.object({
    adgangsplatformen: z.string().nullable(),
  }),
  logoutUrls: z.object({
    adgangsplatformen: z.string().nullable(),
  }),
  libraryInfo: z.object({
    name: z.string().nullable(),
    baseURL: z.string().nullable().optional(),
  }),
  mapp: z
    .object({
      domain: z.string().nullable(),
      id: z.string().nullable(),
    })
    .nullable(),
  unilogin: z.object({
    municipalityId: z.string().nullable(),
  }),
  blacklistedAvailabilityBranches: z
    .array(z.string())
    .nullable()
    .optional()
    .transform(value => value ?? []),
  // Safe fallback while the CMS release without the biblio field is still
  // around: a missing field parses as "disabled".
  biblio: z
    .object({
      enabled: z.boolean(),
      baseUrl: z.string().nullable(),
      sdk: z
        .object({
          applicationId: z.string(),
          firebaseApiKey: z.string(),
          firebaseProjectId: z.string(),
          firebaseAppId: z.string(),
          readerApiKey: z.string(),
        })
        .nullable(),
    })
    .nullable()
    .optional()
    .transform(value => value ?? { enabled: false, baseUrl: null, sdk: null }),
})

export const privateConfigSchema = z.object({
  unilogin: z.object({
    clientSecret: z.string().nullable(),
    pubHubRetailerKeyCode: z.string().nullable(),
  }),
})

export type TDplCmsPublicConfig = z.infer<typeof publicConfigSchema>
