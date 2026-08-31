// Links into the library's own (adult) site. The CMS base URL may be
// configured with a trailing slash; normalize so paths join cleanly.
export const adultSiteUrl = (baseURL: string | null | undefined, path: string): string | null =>
  baseURL ? `${baseURL.replace(/\/$/, "")}${path}` : null
