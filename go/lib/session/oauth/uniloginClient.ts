import { Issuer } from "openid-client"

export const uniloginClientConfig = {
  wellKnownUrl: process.env.UNILOGIN_WELKNOWN_URL,
  url: process.env.UNILOGIN_API_URL,
  audience: process.env.UNILOGIN_API_URL,
  client_id: process.env.UNILOGIN_CLIENT_ID,
  client_secret: process.env.UNILOGIN_CLIENT_SECRET,
  scope: "openid",
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/unilogin`,
  post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}`,
  response_type: "code",
  grant_type: "authorization_code",
  post_login_route: `${process.env.NEXT_PUBLIC_APP_URL}/user/profile`,
}

export async function getUniloginClient({
  client_id,
  client_secret,
  redirect_uri,
  wellKnownUrl,
}: {
  client_id: string
  client_secret: string
  redirect_uri: string
  wellKnownUrl: string
}) {
  const UniloginIssuer = await Issuer.discover(wellKnownUrl!)
  const client = new UniloginIssuer.Client({
    client_id: client_id!,
    client_secret: client_secret!,
    response_types: ["code"],
    redirect_uris: [redirect_uri],
    token_endpoint_auth_method: "client_secret_post",
  })
  return client
}
