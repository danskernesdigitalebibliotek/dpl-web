// Storybook replacement for lib/config/dpl-cms/dplCmsConfig.ts — the real
// module is a server function ("use server") that can't run in Storybook's
// client-only environment. Returns a stable fixture so components depending
// on the public CMS config (e.g. the payment link in HelpFromAdultSection)
// render their full state.
import type { TDplCmsPublicConfig } from "@/lib/config/dpl-cms/configSchemas"

export const getDplCmsPublicConfig = async (): Promise<TDplCmsPublicConfig> => ({
  loginUrls: { adgangsplatformen: null },
  logoutUrls: { adgangsplatformen: null },
  libraryInfo: {
    name: "Storybook Bibliotek",
    baseURL: "https://bibliotek.example",
  },
  mapp: null,
  unilogin: { municipalityId: null },
})

export const getDplCmsPrivateConfig = async () => null
