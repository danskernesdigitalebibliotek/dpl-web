/**
 * Default options for cookies.
 */
export const DEFAULT_COOKIE_OPTIONS: Record<string, boolean | string> = {
  httpOnly: true,
  sameSite: "lax",
  secure: true,
}

/**
 * Options for cookies we want available to JavaScript APIs in the browser.
 */
export const CLIENT_COOKIE_OPTIONS: Record<string, boolean | string> = {
  ...DEFAULT_COOKIE_OPTIONS,
  httpOnly: false,
}
