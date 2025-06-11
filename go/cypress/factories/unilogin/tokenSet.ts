import { Factory } from "fishery"
import * as jwt from "jwt-simple"
import type { TokenEndpointResponse } from "openid-client"

export const sub = "ea18ecf3-17db-42a6-8726-286796b22a9b"
export const session_state = "60cda845-402f-4085-b41d-3e4e773e04d4"
export const institution_ids = "[A04441]"
export const uniid = "Mocked User"

export default Factory.define<TokenEndpointResponse>(() => {
  const now = Math.floor(Date.now() / 1000)
  const auth_time = now - 60

  const issuer = Cypress.env("UNILOGIN_WELLKNOWN_URL")
  const client_id = Cypress.env("UNILOGIN_CLIENT_ID")
  const jwt_secret = "xxx"

  // Common claims for all tokens
  const commonClaims = {
    sub,
    session_state,
    sid: session_state,
    spec_ver: "OIDC.3.0-UNILOGIN",
    has_license: "true",
    broker_id: sub,
    unilogin_loa: "EnFaktor",
    aktoer_gruppe: "Elev",
    institution_ids,
    loa: "2",
    uniid,
  }

  // Access token claims
  const accessTokenClaims = {
    ...commonClaims,
    exp: now + 300,
    iat: now,
    auth_time,
    iss: issuer,
    typ: "Bearer",
    azp: client_id,
    scope: "openid",
  }

  // Refresh token claims
  const refreshTokenClaims = {
    ...commonClaims,
    exp: now + 1800,
    iat: now,
    iss: issuer,
    aud: issuer,
    typ: "Refresh",
    azp: client_id,
    scope: "openid",
  }

  // ID token claims
  const idTokenClaims = {
    ...commonClaims,
    exp: now + 300,
    iat: now,
    auth_time,
    iss: issuer,
    aud: client_id,
    typ: "ID",
    azp: client_id,
  }

  // Create signed JWT tokens using jwt-simple library
  const access_token = jwt.encode(accessTokenClaims, jwt_secret, "HS256")
  const refresh_token = jwt.encode(refreshTokenClaims, jwt_secret, "HS256")
  const id_token = jwt.encode(idTokenClaims, jwt_secret, "HS256")

  return {
    access_token,
    expires_in: 300,
    refresh_expires_in: 1799,
    refresh_token,
    token_type: "bearer",
    id_token,
    "not-before-policy": 0,
    session_state,
    scope: "openid",
    sub,
  }
})
