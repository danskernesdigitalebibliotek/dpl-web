export type FbsConfig = {
  baseUrl: string
  getAuthHeader: () => Promise<string> | string
}
