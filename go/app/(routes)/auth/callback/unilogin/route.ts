import { NextRequest, NextResponse } from "next/server"
import * as client from "openid-client"
import type { IntrospectionResponse } from "openid-client"

import { getEnv } from "@/lib/config/env"
import goConfig from "@/lib/config/goConfig"
import { getInstitutionId, getInstitutionIds } from "@/lib/helpers/unilogin"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import {
  destroySession,
  getSession,
  getSessionOptions,
  setUniloginTokensOnSession,
} from "@/lib/session/session"
import { TUniloginTokenSet } from "@/lib/types/session"

import { logoutUniloginSSO } from "../../logout/helpers"
import { isUniloginUserAuthorizedToLogIn } from "./helper"
import schemas from "./schemas"

type TClaims = {
  exp: number
  iat: number
  auth_time: number
  jti: string
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  session_state: string
  at_hash: string
  sid: string
  spec_ver: string
  has_license: string
  broker_id: string
  unilogin_loa: string
  aktoer_gruppe: string
  institution_ids: string
  loa: string
  uniid: string
}

export interface TIntrospectionResponse extends IntrospectionResponse {
  uniid: string
  institution_ids: string
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  const config = await getUniloginClientConfig()
  const appUrl = getEnv("APP_URL")
  const sessionOptions = await getSessionOptions()

  if (!config || !sessionOptions) {
    return NextResponse.redirect(appUrl)
  }

  const currentSearchParams = request.nextUrl.searchParams
  const redirectUri = new URL(`${appUrl}/auth/callback/unilogin`)
  currentSearchParams.forEach((value, key) => {
    redirectUri.searchParams.append(key, value)
  })

  // TODO: When we consider the callback being stable we can remove this.
  // Maybe we can organize openid client logging in some way:
  //
  // config[client.customFetch] = async (url: string, options: RequestInit) => {
  //   // eslint-disable-next-line no-console
  //   console.log("Request URL: ", url.toString())
  //   // eslint-disable-next-line no-console
  //   console.log("Request Options: ", options)

  //   const request = new Request(url, options)
  //   return fetch(request)
  // }

  // Fetch all user/token info.
  try {
    const tokenSetResponse = await client.authorizationCodeGrant(config, redirectUri, {
      pkceCodeVerifier: session.code_verifier,
      idTokenExpected: true,
    })

    const tokenSet = schemas.tokenSet.parse(tokenSetResponse) as TUniloginTokenSet

    const introspectResponse = (await client.tokenIntrospection(
      config,
      tokenSet.access_token!
    )) as TIntrospectionResponse
    const introspect = schemas.introspect.parse(introspectResponse)

    const claims = tokenSetResponse.claims()! as TClaims

    // UserInfo Request
    const userInfoResponse = await client.fetchUserInfo(config, tokenSet.access_token, claims.sub)
    const userinfo = schemas.uniLoginUserInfo.parse(userInfoResponse)

    // Set basic session info.
    session.isLoggedIn = true
    session.type = "unilogin"

    // Set token info.
    setUniloginTokensOnSession(session, tokenSet)

    const institutionId = getInstitutionId(introspect.institution_ids)
    // Check if user is authorized to log.
    const isAuthorized = await isUniloginUserAuthorizedToLogIn(institutionId, claims)
    if (!isAuthorized) {
      // Make sure that the user is logged out remotely first. And destroy session.
      await logoutUniloginSSO(session)
      await destroySession(session)
      // Redirect user to login not authorized page.
      return NextResponse.redirect(
        `${getEnv("APP_URL")}/${goConfig("routes.login-not-authorized")}`
      )
    }

    // Set user info.
    // TODO: After Publizon allows DDF test users to loan, we can remove thie if statement.
    session.uniLoginUserInfo = {
      sub: userinfo.sub,
      uniid: introspect.uniid,
      // TODO: Rename this into institutionIds
      institution_ids:
        institutionId === "A04441" ? ["101047"] : getInstitutionIds(introspect.institution_ids),
    }
    session.user = {
      // Unilogin does not provide a name, so we set it to undefined.
      name: undefined,
      username: introspect.uniid,
    }

    await session.save()
  } catch (error) {
    console.error(error)
    // Make sure that the user is logged out remotely first. And destroy session.
    await logoutUniloginSSO(session)
    await destroySession(session)
    return NextResponse.redirect(`${getEnv("APP_URL")}/${goConfig("routes.login-failed")}`)
  }

  return NextResponse.redirect(`${getEnv("APP_URL")}/user/profile`)
}

export const dynamic = "force-dynamic"
