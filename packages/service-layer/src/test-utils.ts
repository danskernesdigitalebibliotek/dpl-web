// Helpers for the per-API client tests. Test-only: not exported from the
// package entry point.

// A fake fetch Response carrying a JSON body, just complete enough for the
// clients' ok/status/json handling.
export const mockJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  }) as Response
