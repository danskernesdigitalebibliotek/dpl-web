"use server"

import { IronSession } from "iron-session"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import * as client from "openid-client"
import { z } from "zod"

import goConfig from "../config/goConfig"
import {
  TSessionData,
  destroySession,
  getSession,
  setUniloginTokensOnSession,
} from "../session/session"
import { TUniloginTokenSet } from "../types/session"
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
  const userToken = session?.adgangsplatformenUserToken

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

export const refreshUniloginTokens = async (
  session: IronSession<TSessionData>,
  config: client.Configuration
) => {
  const sessionTokenSchema = z.object({
    isLoggedIn: z.boolean(),
    access_token: z.string(),
    refresh_token: z.string(),
  })

  try {
    // TODO: Consider if we want to handle different types of sessions than unilogin.
    const tokens = sessionTokenSchema.parse(session)
    const newTokens = (await client.refreshTokenGrant(
      config,
      tokens.refresh_token
    )) as unknown as TUniloginTokenSet
    await setUniloginTokensOnSession(session, newTokens)
    await session.save()
  } catch (error) {
    // Session is corrupt so we need to destroy it.
    destroySession(session)

    const isZodError = error instanceof z.ZodError
    console.error("refreshUniloginTokens error", isZodError ? JSON.stringify(error.issues) : error)
  }
}
