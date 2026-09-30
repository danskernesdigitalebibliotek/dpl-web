import { NextRequest, NextResponse, connection } from "next/server"
import * as client from "openid-client"

import { getBaseURL } from "@/lib/config/getBaseURL"
import goConfig from "@/lib/config/goConfig"
import { getAndClearLoginRedirectUrl } from "@/lib/helpers/login-redirect"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import {
  TSessionData,
  destroySession,
  getSession,
  removeLoginStateFromSession,
  setUniloginTokensOnSession,
} from "@/lib/session/session"
import { TUniloginTokenSet } from "@/lib/types/session"

import { revokeUniloginTokens } from "../../logout/helpers"
import {
  TEST_INSTITUTION_IDS,
  isUniloginUserAuthorizedToLogIn,
  parseUniloginServiceResponse,
} from "./helper"
import schemas from "./schemas"

interface TUniloginLoginContext {
  session?: TSessionData
  tokenSet?: client.TokenEndpointResponse
  userinfo?: unknown
}

const fetchUserinfo = async (config: client.Configuration, accessToken: string) => {
  const userinfoEndpoint = config.serverMetadata().userinfo_endpoint
  if (!userinfoEndpoint) {
    throw new Error("Missing userinfo endpoint in Unilogin client config")
  }
  const response = await fetch(userinfoEndpoint, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(`Unilogin userinfo request failed with status ${response.status}`)
  }
  return response.json()
}

export async function GET(request: NextRequest) {
  await connection() // Opt into dynamic rendering
  const session = await getSession()
  const config = await getUniloginClientConfig()
  const appUrl = getBaseURL()
  const loginContext: TUniloginLoginContext = {
    session,
  }

  if (session.isLoggedIn) {
    return NextResponse.redirect(`${appUrl}/user/profile`)
  }

  if (!config) {
    return NextResponse.redirect(appUrl)
  }

  const currentSearchParams = request.nextUrl.searchParams
  const redirectUri = new URL(`${appUrl}/auth/callback/unilogin`)
  currentSearchParams.forEach((value, key) => {
    redirectUri.searchParams.append(key, value)
  })

  // Fetch all user/token info.
  try {
    const tokenSetResponse = await client.authorizationCodeGrant(config, redirectUri, {
      expectedState: session.state,
    })
    loginContext.tokenSet = tokenSetResponse
    const tokenSet = parseUniloginServiceResponse({
      step: "tokenSet",
      parsingFunction: () => schemas.tokenSet.parse(tokenSetResponse),
    }) as TUniloginTokenSet

    // The state has served its purpose once the code is exchanged.
    await removeLoginStateFromSession(session)

    // The adapter exposes all Unilogin claims through its userinfo endpoint,
    // so no introspection or institution lookup is needed.
    const userinfoResponse = await fetchUserinfo(config, tokenSet.access_token)
    loginContext.userinfo = userinfoResponse
    const { attributes } = parseUniloginServiceResponse({
      step: "userinfo",
      parsingFunction: () => schemas.userinfo.parse(userinfoResponse),
    })

    // Check if user is authorized to log in.
    if (!isUniloginUserAuthorizedToLogIn(attributes)) {
      // The token is of no further use, so revoke it before destroying the session.
      await revokeUniloginTokens(tokenSet.access_token)
      await destroySession(session)
      // Redirect user to login not authorized page.
      return NextResponse.redirect(`${getBaseURL()}/${goConfig("routes.login-not-authorized")}`)
    }

    // Set basic session info.
    session.isLoggedIn = true
    session.type = "unilogin"

    // Set token info.
    await setUniloginTokensOnSession(session, tokenSet)

    const isTestUser = attributes.uniloginInstitutionIds.some(id =>
      TEST_INSTITUTION_IDS.includes(id)
    )
    // Set user info.
    session.uniLoginUserInfo = {
      uniid: attributes.uniloginUniId,
      // Test users belong to the DDF test institution which Publizon does not
      // know. They are mapped to "101047" ("Christianshavns skole") so they
      // can loan/reserve e-materials.
      institutionIds: isTestUser ? ["101047"] : attributes.uniloginInstitutionIds,
    }
    session.user = {
      // Unilogin does not provide a name, so we set it to undefined.
      name: undefined,
      username: attributes.uniloginUniId,
    }

    await session.save()
    console.info(`unilogin success - uniid: ${attributes.uniloginUniId} logged in successfully`)
    const loginRedirectUrl = await getAndClearLoginRedirectUrl()
    if (loginRedirectUrl) {
      return NextResponse.redirect(`${getBaseURL()}${loginRedirectUrl}`)
    }
    return NextResponse.redirect(`${getBaseURL()}/user/profile`)
  } catch (error) {
    console.error("unilogin error", error, loginContext)
    await destroySession(session)
    return NextResponse.redirect(`${getBaseURL()}/${goConfig("routes.login-failed-unilogin")}`)
  }
}
