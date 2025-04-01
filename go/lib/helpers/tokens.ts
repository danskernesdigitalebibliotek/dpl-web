"use server"

import { IronSession } from "iron-session"
import { cookies } from "next/headers"
import { z } from "zod"

import { getEnv } from "../config/env"
import goConfig from "../config/goConfig"
import getQueryClient from "../getQueryClient"
import {
  GetAdgangsplatformenLibraryTokenQuery,
  GetAdgangsplatformenUserTokenQuery,
  useGetAdgangsplatformenLibraryTokenQuery,
  useGetAdgangsplatformenUserTokenQuery,
} from "../graphql/generated/dpl-cms/graphql"
import { TSessionData, getDplCmsSessionCookie, getSession } from "../session/session"
import { TServiceType, getServiceSettings } from "./services"

export const libraryTokenExist = async () => {
  const cookieValue = await getLibraryTokenCookieValue()
  return Boolean(cookieValue ?? false)
}

export const getLibraryTokenCookieValue = async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(goConfig("library-token.cookie-name"))
  return cookie?.value
}

export const setLibraryTokenCookie = async (token: string, expires: Date) => {
  const cookieStore = await cookies()
  cookieStore.set(goConfig("library-token.cookie-name"), token, { expires, sameSite: "lax" })
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

  // If we are in test mode, we can't load the library token
  // TODO: Mock library token while testing
  if (getEnv("TEST_MODE")) {
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

export const getBearerTokenServerSide = async (
  serviceType: TServiceType,
  session?: IronSession<TSessionData>
) => {
  const useLibraryToken = getServiceSettings(serviceType)?.useLibraryTokenAlways ?? true
  const libraryToken = await getLibraryTokenCookieValue()
  const userToken = session?.adgangsplatformenUserToken
  if (useLibraryToken && libraryToken) {
    return libraryToken
  }

  if (userToken) {
    return userToken
  }

  if (libraryToken) {
    return libraryToken
  }

  return null
}

export const createServerQueryFn = async <TQuery, TVariables>(
  fetcher: (variables: TVariables, options?: RequestInit["headers"]) => () => Promise<TQuery>,
  variables: TVariables,
  options?: RequestInit["headers"]
) => {
  const session = await getSession()
  const bearerToken = await getBearerTokenServerSide("fbi", session)

  return fetcher(variables, { ...options, Authorization: `Bearer ${bearerToken}` })
}
