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
  document.cookie = `${LOGIN_REDIRECT_COOKIE_NAME}=${encodeURIComponent(path)}; path=/; SameSite=Lax; max-age=600`
}

/**
 * Delete the login redirect cookie from client-side code.
 */
export const deleteLoginRedirectCookie = () => {
  cookieStore.delete(LOGIN_REDIRECT_COOKIE_NAME)
}

/**
 * Read and clear the login redirect cookie from the server side.
 * Returns the redirect URL if set, otherwise null.
 */
export const getAndClearLoginRedirectUrl = async (): Promise<string | null> => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const redirectUrl = cookieStore.get(LOGIN_REDIRECT_COOKIE_NAME)?.value

  if (!redirectUrl) {
    return null
  }

  const decodedUrl = decodeURIComponent(redirectUrl)

  // Validate: only allow relative paths to prevent open redirect
  if (!decodedUrl.startsWith("/") || decodedUrl.startsWith("//")) {
    cookieStore.delete(LOGIN_REDIRECT_COOKIE_NAME)
    return null
  }

  // Clear the cookie after reading
  cookieStore.delete(LOGIN_REDIRECT_COOKIE_NAME)
  return decodedUrl
}
