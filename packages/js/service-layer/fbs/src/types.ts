export type FbsConfig = {
  baseUrl: string
  getAuthHeader: () => Promise<string | null> | string | null
}
