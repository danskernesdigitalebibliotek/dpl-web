export type FbiConfig = {
  baseUrl: string
  getAuthHeader: () => Promise<string> | string
}
