// A non-OK answer from the adapter. The status is kept so callers can tell an
// expired session or a client error from an outage.
export class BiblioHttpError extends Error {
  readonly status: number

  constructor(method: string, path: string, status: number, statusText: string) {
    super(`Biblio ${method} ${path} failed: ${status} ${statusText}`)
    this.name = "BiblioHttpError"
    this.status = status
  }
}
