import { cookies } from "next/headers";
import { generators } from "openid-client";

import {
  getUniloginClient,
  uniloginClientConfig
} from "@/lib/session/oauth/uniloginClient";
import { defaultSession, getSession } from "@/lib/session/session";

// TODO: This is a code block copy/pasted from an online article. Make it real yo.
export async function GET() {
  const session = await getSession();
  const frontpage = `${process.env.NEXT_PUBLIC_APP_URL!}/`;

  switch (session.type) {
    case "unilogin":
      const id_token = cookies().get("go-session:id_token")?.value;
      // TODO: Is this where we want to redirect to if id token cannot be resolved?
      if (!id_token) {
        return Response.redirect("/");
      }
      const client = await getUniloginClient();
      const endSession = client.endSessionUrl({
        post_logout_redirect_uri: uniloginClientConfig.post_logout_redirect_uri,
        id_token_hint: id_token,
        state: generators.state()
      });
      session.isLoggedIn = defaultSession.isLoggedIn;
      session.access_token = defaultSession.access_token;
      session.userInfo = defaultSession.userInfo;
      await session.save();
      return Response.redirect(endSession);
    default:
      return Response.redirect(frontpage);
  }
}
