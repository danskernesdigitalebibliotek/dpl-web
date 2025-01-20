import { sealData } from "iron-session"
import { NextRequest, NextResponse } from "next/server"
import * as client from "openid-client"

import goConfig from "@/lib/config/goConfig"
import { getUniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession, sessionOptions, setTokensOnSession } from "@/lib/session/session"
import { TTokenSet } from "@/lib/types/session"

import schemas from "./schemas"

export interface TIntrospectionResponse extends client.IntrospectionResponse {
  uniid: string
  institutionIds: string
}

export async function GET(request: NextRequest) {
  const session = await getSession({ request, response: NextResponse.next() })
  const config = await getUniloginClientConfig()
  const currentSearchParams = request.nextUrl.searchParams
  const appUrl = goConfig("app.url")
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

    const tokenSet = schemas.tokenSet.parse(tokenSetResponse) as TTokenSet

    const introspectResponse = (await client.tokenIntrospection(
      config,
      tokenSet.access_token!
    )) as TIntrospectionResponse
    const introspect = schemas.introspect.parse(introspectResponse)

    const claims = tokenSetResponse.claims()!

    // UserInfo Request
    const userInfoResponse = await client.fetchUserInfo(config, tokenSet.access_token, claims.sub)
    const userinfo = schemas.userInfo.parse(userInfoResponse)

    // Set basic session info.
    session.isLoggedIn = true
    session.type = "unilogin"

    // Set token info.
    setTokensOnSession(session, tokenSet)

    // Set user info.
    session.userInfo = {
      sub: userinfo.sub,
      uniid: introspect.uniid,
      institutionIds: introspect.institutionIds,
    }

    // TODO: When we have verified that it works in Lagoon
    // then see if we can reintroduce this, instead of the "handmade" cookie in the end.
    // await session.save()
  } catch (error) {
    console.error(error)
    // TODO: Error page or redirect to login page.
    // return NextResponse.redirect(goConfig("app.url"))
  }

  const sealed = await sealData(
    {
      ...session,
    },
    sessionOptions
  )

  // TODO: When we have verified that it works in Lagoon
  // then see if we can use the session.save() instead of the "handmade" cookie here.
  // Also we  probably would like to go to different URL's depending on the try/catch above.
  const headers = new Headers(request.headers)
  headers.set(
    "Set-Cookie",
    `${sessionOptions.cookieName}=${sealed}; Max-Age=${sessionOptions.ttl}; Path=/; HttpOnly; ${sessionOptions.cookieOptions?.secure && "Secure"}`
  )

  return NextResponse.redirect(`${goConfig("app.url")}/user/profile`, {
    headers,
  })
}

export const dynamic = "force-dynamic"
