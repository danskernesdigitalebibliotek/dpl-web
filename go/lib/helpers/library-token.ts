import { z } from "zod"

import { useGetAdgangsplatformenLibraryTokenQuery } from "../graphql/generated/dpl-cms/graphql"

export const loadLibraryToken = async () => {
  try {
    const data = await useGetAdgangsplatformenLibraryTokenQuery.fetcher()()

    const validateLibraryToken = z
      .object({
        token: z.string(),
        expire: z.object({
          timestamp: z.number(),
        }),
      })
      .safeParse(data?.dplTokens?.adgangsplatformen?.library)

    if (validateLibraryToken.error) {
      console.error("Error parsing library token:", validateLibraryToken.error.flatten())
      return null
    }
    return validateLibraryToken.data
  } catch (error) {
    console.error("Could not load library token.", error)
    return null
  }
}
