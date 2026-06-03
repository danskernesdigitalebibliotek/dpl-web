export type FbsConfig = {
  baseUrl: string
  // Return the Authorization header value (e.g. "Bearer ..."), or `null` when
  // no token is available. `null` means "do not set the header" — typical for
  // proxy-fronted setups where the proxy fills auth from a session cookie.
  // An empty string is not a valid signal and will throw at runtime.
  getAuthHeader: () => Promise<string | null> | string | null
}
