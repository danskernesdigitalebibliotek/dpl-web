"use server"

import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

import goConfig from "../config/goConfig"
import { getPatronUserToken, getSession } from "../session/session"
import { TServiceType, getApServiceSettings } from "./ap-service"

export const getBearerTokenServerSide = async (
  serviceType: TServiceType,
  cookieStore: ReadonlyRequestCookies
) => {
  const useLibraryToken = getApServiceSettings(serviceType)?.useLibraryTokenAlways ?? true
  const libraryToken = cookieStore.get(goConfig("library-token.cookie-name"))?.value
  if (useLibraryToken && libraryToken) {
    return libraryToken
  }

  const session = await getSession()
  const userToken = getPatronUserToken(session)

  if (userToken) {
    return userToken
  }

  if (libraryToken) {
    return libraryToken
  }

  return null
}

export const createServerQueryFn = async <TQuery, TVariables>({
  fetcher,
  variables,
  options,
  cookieStore,
}: {
  fetcher: (variables: TVariables, options?: RequestInit["headers"]) => () => Promise<TQuery>
  variables: TVariables
  options?: RequestInit["headers"]
  cookieStore: ReadonlyRequestCookies
}) => {
  const bearerToken = await getBearerTokenServerSide("fbi", cookieStore)
  return fetcher(variables, { ...options, authorization: `Bearer ${bearerToken}` })
}
