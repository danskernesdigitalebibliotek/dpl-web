import { cookies } from "next/headers"
import { z } from "zod"

import goConfig from "../config/goConfig"
import { useGetAdgangsplatformenLibraryTokenQuery } from "../graphql/generated/dpl-cms/graphql"

export const setLibraryTokenCookie = async (token: string, expires: Date) => {
  const cookieStore = await cookies()
  cookieStore.set(goConfig("library-token.cookie-name"), token, { expires, sameSite: "lax" })
}

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
  } catch {
    console.error("Could not load library token.")
    return null
  }
}
