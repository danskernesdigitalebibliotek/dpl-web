export type BiblioConfig = {
  baseUrl: string
  getAuthHeader: () => Promise<string> | string
}
