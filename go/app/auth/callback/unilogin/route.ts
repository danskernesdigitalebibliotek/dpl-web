import { NextRequest } from "next/server"
import { IntrospectionResponse } from "openid-client"

import goConfig from "@/lib/config/config"
import { getUniloginClient, uniloginClientConfig } from "@/lib/session/oauth/uniloginClient"
import { getSession, setTokensOnSession } from "@/lib/session/session"
import { TTokenSet } from "@/lib/types/session"

import schemas from "./schemas"

export interface TIntrospectionResponse extends IntrospectionResponse {
  uniid: string
  institutionIds: string
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  const client = await getUniloginClient()
  const params = client.callbackParams(request.nextUrl.toString())

  // Fetch all user/token info.
  try {
    const tokenSetResponse = await client.callback(uniloginClientConfig.redirect_uri, params, {
      code_verifier: session.code_verifier,
    })
    const tokenSet = schemas.tokenSet.parse(tokenSetResponse) as TTokenSet

    const introspectResponse = (await client.introspect(
      tokenSet.access_token!
    )) as TIntrospectionResponse
    const introspect = schemas.introspect.parse(introspectResponse)

    const userinfoResponse = await client.userinfo(tokenSetResponse)
    const userinfo = schemas.userInfo.parse(userinfoResponse)

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

    await session.save()

    return Response.redirect(uniloginClientConfig.post_login_route)
  } catch (error) {
    console.error(error)
    // TODO: Error page or redirect to login page.
    return Response.redirect(goConfig("app.url"))
  }
}
