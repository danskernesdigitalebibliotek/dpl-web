import { deleteCookie, getCookie, setCookie } from "cookies-next/client"

import { CLIENT_COOKIE_OPTIONS } from "@/lib/config/cookies"

const LOGIN_REDIRECT_COOKIE_NAME = "go-login-redirect"

/**
 * Set a cookie with the URL to redirect to after login.
 * This is meant to be called from client-side code (e.g. onClick handlers).
 */
export const setLoginRedirectCookie = (path: string) => {
  // Only allow relative paths to prevent open redirect
  if (!path.startsWith("/") || path.startsWith("//")) {
    return
  }
  setCookie(LOGIN_REDIRECT_COOKIE_NAME, path, {
    maxAge: 600,
    ...CLIENT_COOKIE_OPTIONS,
  })
}

/**
 * Delete the login redirect cookie from client-side code.
 */
export const deleteLoginRedirectCookie = async () => {
  deleteCookie(LOGIN_REDIRECT_COOKIE_NAME)
}

/**
 * Read and clear the login redirect cookie from the server side.
 * Returns the redirect URL if set, otherwise null.
 */
export const getAndClearLoginRedirectUrl = async (): Promise<string | null> => {
  const redirectUrl = getCookie(LOGIN_REDIRECT_COOKIE_NAME)

  if (!redirectUrl) {
    return null
  }

  const decodedUrl = decodeURIComponent(redirectUrl)

  // Validate: only allow relative paths to prevent open redirect
  if (!decodedUrl.startsWith("/") || decodedUrl.startsWith("//")) {
    deleteCookie(LOGIN_REDIRECT_COOKIE_NAME)
    return null
  }

  // Clear the cookie after readin
  deleteCookie(LOGIN_REDIRECT_COOKIE_NAME)
  return decodedUrl
}
