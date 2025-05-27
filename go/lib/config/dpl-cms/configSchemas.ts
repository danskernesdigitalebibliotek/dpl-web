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
  }),
  unilogin: z.object({
    municipalityId: z.string().nullable(),
  }),
})

export const privateConfigSchema = z.object({
  unilogin: z.object({
    clientSecret: z.string().nullable(),
    webServiceUsername: z.string().nullable(),
    webServicePassword: z.string().nullable(),
    pubHubRetailerKeyCode: z.string().nullable(),
  }),
})

export type TDplCmsPublicConfig = z.infer<typeof publicConfigSchema>
export type TDplCmsPrivateConfig = z.infer<typeof privateConfigSchema>
