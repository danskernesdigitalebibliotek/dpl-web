import { cookies } from "next/headers"
import { z } from "zod"

import goConfig from "../config/goConfig"
import getQueryClient from "../getQueryClient"
import {
  GetAdgangsplatformenLibraryTokenQuery,
  GetAdgangsplatformenUserTokenQuery,
  useGetAdgangsplatformenLibraryTokenQuery,
  useGetAdgangsplatformenUserTokenQuery,
} from "../graphql/generated/dpl-cms/graphql"
import { getDplCmsSessionCookie } from "../session/session"

export const libraryTokenExist = async () => {
  const cookieValue = await getLibraryTokenCookie()
  return Boolean(cookieValue ?? false)
}

export const getLibraryTokenCookie = async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(goConfig("library-token.cookie-name"))
  // console.log("cookie", cookie)
  return cookie?.value
}

export const setLibraryTokenCookie = async (token: string, expires: Date) => {
  const cookieStore = await cookies()
  cookieStore.set(goConfig("library-token.cookie-name"), token, { expires })
}

export const loadUserToken = async () => {
  const queryClient = getQueryClient()
  const sessionCookie = await getDplCmsSessionCookie()
  if (!sessionCookie) {
    return null
  }

  try {
    const data = await queryClient.fetchQuery<GetAdgangsplatformenUserTokenQuery>({
      queryKey: useGetAdgangsplatformenUserTokenQuery.getKey(),
      queryFn: useGetAdgangsplatformenUserTokenQuery.fetcher(undefined, {
        headers: {
          Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
        },
      }),
      initialData: {},
      staleTime: 0,
    })
    const validateUserToken = z
      .object({
        token: z.string(),
        expire: z.number(),
      })
      .safeParse(data?.dplTokens?.adgangsplatformen?.user)

    if (validateUserToken.error) {
      console.error(validateUserToken.error.flatten)
      return null
    }

    return validateUserToken.data
  } catch {
    console.error("Could not load user token.")
    return null
  }
}

export const loadLibraryToken = async () => {
  const queryClient = getQueryClient()
  const sessionCookie = await getDplCmsSessionCookie()

  if (!sessionCookie) {
    return null
  }

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
