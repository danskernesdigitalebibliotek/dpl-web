export type FbsConfig = {
  // The FBS root URL. May be a plain string or a callback that returns one —
  // use the callback form when the value isn't known at provider-mount time
  // (e.g. it lives in a redux store that gets populated later in app init).
  // The callback is invoked once per request.
  baseUrl: string | (() => string)
  // Return the Authorization header value (e.g. "Bearer ..."), or `null` when
  // no token is available. `null` means "do not set the header" — typical for
  // proxy-fronted setups where the proxy fills auth from a session cookie.
  // An empty string is not a valid signal and will throw at runtime.
  getAuthHeader: () => Promise<string | null> | string | null
}
