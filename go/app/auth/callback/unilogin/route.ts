import {
  uniloginClientConfig,
  getUniloginClient
} from "@/lib/session/oauth/uniloginClient";
import { getSession } from "@/lib/session/session";
import { IncomingMessage } from "http";
import { cookies } from "next/headers";
import { IntrospectionResponse } from "openid-client";
import { z } from "zod";
import schemas from "./schemas";

export interface TIntrospectionResponse extends IntrospectionResponse {
  uniid: string;
  institutionIds: string;
}

export async function GET(request: IncomingMessage) {
  const session = await getSession();
  const client = await getUniloginClient();
  const params = client.callbackParams(request);

  // Fetch all user/token info.
  try {
    const tokenSetResponse = await client.callback(
      uniloginClientConfig.redirect_uri,
      params,
      {
        code_verifier: session.code_verifier
      }
    );
    const tokenSet = schemas.tokenSet.parse(tokenSetResponse);

    const introspectResponse = (await client.introspect(
      tokenSet.access_token!
    )) as TIntrospectionResponse;
    const introspect = schemas.introspect.parse(introspectResponse);

    const userinfoResponse = await client.userinfo(tokenSetResponse);
    const userinfo = schemas.userInfo.parse(userinfoResponse);

    // Set basic session info.
    session.isLoggedIn = true;
    session.type = "unilogin";

    // Set token info.
    session.access_token = tokenSet.access_token;
    session.refresh_token = tokenSet.refresh_token;
    session.expire = new Date(Date.now() + tokenSet.expires_in! * 1000);
    // Since we have a limitation in how big cookies can be,
    // we will have to store the user id in a separate cookie.
    cookies().set("go-session:id_token", tokenSet.id_token);

    // Set user info.
    session.userInfo = {
      sub: userinfo.sub,
      uniid: introspect.uniid,
      institutionIds: introspect.institutionIds
    };

    await session.save();

    return Response.redirect(uniloginClientConfig.post_login_route);
  } catch (error) {
    console.error(error);
    // TODO: Error page or redirect to login page.
    return Response.redirect("/");
  }
}
