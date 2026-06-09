import { getCookie } from "cookies-next/client"

import { AuthenticationMethod, SESSION_TYPE_COOKIE_NAME } from "@/lib/session/definitions"

export function getAuthenticationMethodFromCookie() {
  return getCookie(SESSION_TYPE_COOKIE_NAME) as AuthenticationMethod | undefined
}

export const withSessionType = <Args extends unknown[], Return>(
  fn: (sessionType: AuthenticationMethod, ...args: Args) => Return
): ((...args: Args) => Return) => {
  return (...args) => {
    const authMethod = getAuthenticationMethodFromCookie()
    return fn(authMethod ?? "anonymous", ...args)
  }
}
