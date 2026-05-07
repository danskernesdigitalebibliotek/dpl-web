import { NextRequest, NextResponse, connection } from "next/server"
import * as client from "openid-client"

import { getEnv } from "@/lib/config/env"
import goConfig from "@/lib/config/goConfig"
import { getAndClearLoginRedirectUrl } from "@/lib/helpers/login-redirect"
import { getInstitutionId, getInstitutionIds } from "@/lib/helpers/unilogin"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import {
  TSessionData,
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

interface TUniloginLoginContext {
  session?: TSessionData
  tokenSet?: client.TokenEndpointResponse
}

export async function GET(request: NextRequest) {
  await connection() // Opt into dynamic rendering
  const session = await getSession()
  const config = await getUniloginClientConfig()
  const appUrl = getEnv("APP_URL")
  const sessionOptions = await getSessionOptions()
  const loginContext: TUniloginLoginContext = {
    session,
  }

  if (session.isLoggedIn) {
    return NextResponse.redirect(`${appUrl}/user/profile`)
  }

  // TODO: remove "!sessionOptions" as it can never be false
  if (!config || !sessionOptions) {
    return NextResponse.redirect(appUrl)
  }

  const currentSearchParams = request.nextUrl.searchParams
  const redirectUri = new URL(`${appUrl}/auth/callback/unilogin`)
  currentSearchParams.forEach((value, key) => {
    redirectUri.searchParams.append(key, value)
  })

  // Fetch token and read claims from id_token.
  try {
    const tokenSetResponse = await client.authorizationCodeGrant(config, redirectUri, {
      pkceCodeVerifier: session.code_verifier,
      idTokenExpected: true,
    })
    loginContext.tokenSet = tokenSetResponse
    const tokenSet = schemas.tokenSet.parse(tokenSetResponse) as TUniloginTokenSet
    const claims = tokenSetResponse.claims()! as TClaims

    // Set basic session info.
    session.isLoggedIn = true
    session.type = "unilogin"

    // Set token info.
    setUniloginTokensOnSession(session, tokenSet)

    const institutionId = getInstitutionId(claims.institution_ids)
    // Check if user is authorized to log in.
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
      sub: claims.sub,
      uniid: claims.uniid,
      institutionIds:
        // A04441 is a testinstitution for DDF test users.
        // If the user is a DDF test user, we set the institutionIds to a hardcoded value.
        // The hardcoded value happens to be: "Christianshavns skole".
        // Otherwise the testusers wont be able to loan/reserve e-materials.
        institutionId === "A04441" ? ["101047"] : getInstitutionIds(claims.institution_ids),
    }
    session.user = {
      // Unilogin does not provide a name, so we set it to undefined.
      name: undefined,
      username: claims.uniid,
    }

    await session.save()
    console.info(`unilogin success - uniid: ${claims.uniid} logged in successfully`)
    const loginRedirectUrl = await getAndClearLoginRedirectUrl()
    if (loginRedirectUrl) {
      return NextResponse.redirect(`${getEnv("APP_URL")}${loginRedirectUrl}`)
    }
    return NextResponse.redirect(`${getEnv("APP_URL")}/user/profile`)
  } catch (error) {
    console.error("unilogin error", error, loginContext)
    // Make sure that the user is logged out remotely first. And destroy session.
    await logoutUniloginSSO(session)
    await destroySession(session)
    return NextResponse.redirect(`${getEnv("APP_URL")}/${goConfig("routes.login-failed-unilogin")}`)
  }
}
