import { cookies } from "next/headers"
import { z } from "zod"

import goConfig from "../config/goConfig"
import getQueryClient from "../getQueryClient"
import {
  GetAdgangsplatformenLibraryTokenQuery,
  useGetAdgangsplatformenLibraryTokenQuery,
} from "../graphql/generated/dpl-cms/graphql"

export const setLibraryTokenCookie = async (token: string, expires: Date) => {
  const cookieStore = await cookies()
  cookieStore.set(goConfig("library-token.cookie-name"), token, { expires, sameSite: "lax" })
}

export const loadLibraryToken = async () => {
  const queryClient = getQueryClient()

  try {
    const data = await queryClient.fetchQuery<GetAdgangsplatformenLibraryTokenQuery>({
      queryKey: useGetAdgangsplatformenLibraryTokenQuery.getKey(),
      queryFn: useGetAdgangsplatformenLibraryTokenQuery.fetcher(),
      initialData: {},
      staleTime: 0,
    })
    const validateLibraryToken = z
      .object({
        token: z.string(),
        expire: z.object({
          timestamp: z.number(),
        }),
      })
      .safeParse(data?.dplTokens?.adgangsplatformen?.library)

    if (validateLibraryToken.error) {
      console.error(validateLibraryToken.error)
      return null
    }
    return validateLibraryToken.data
  } catch {
    console.error("Could not load library token.")
    return null
  }
}
