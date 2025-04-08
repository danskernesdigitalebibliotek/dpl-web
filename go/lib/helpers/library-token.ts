"use server"

import { cookies } from "next/headers"
import { z } from "zod"

import { getEnv } from "../config/env"
import goConfig from "../config/goConfig"
import getQueryClient from "../getQueryClient"
import {
  GetAdgangsplatformenLibraryTokenQuery,
  useGetAdgangsplatformenLibraryTokenQuery,
} from "../graphql/generated/dpl-cms/graphql"

export const getLibraryTokenCookieValue = async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(goConfig("library-token.cookie-name"))
  return cookie?.value
}

export const setLibraryTokenCookie = async (token: string, expires: Date) => {
  const cookieStore = await cookies()
  cookieStore.set(goConfig("library-token.cookie-name"), token, { expires, sameSite: "lax" })
}

export const loadLibraryToken = async () => {
  // If we are in test mode, we can't load the library token
  // TODO: Mock library token while testing
  if (getEnv("TEST_MODE")) {
    return null
  }

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
      console.error(validateLibraryToken.error.flatten)
      return null
    }
    return validateLibraryToken.data
  } catch {
    console.error("Could not load library token.")
    return null
  }
}
