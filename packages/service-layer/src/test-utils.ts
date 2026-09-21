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

// A work as `catalogueDetailsByIsbn` returns it. The FBI adapter matches a
// work through the ISBNs on its manifestations, so the ISBNs are a list.
export const catalogueWork = (title: string, authors: string[], isbns: string[]) => ({
  titles: { full: [title] },
  creators: authors.map(display => ({ display })),
  manifestations: {
    all: isbns.map(isbn => ({ identifiers: [{ type: "ISBN", value: isbn }] })),
  },
})

/** The search result the FBI mapper parses. */
export const catalogueSearchResult = (works: unknown[]) => ({
  complexSearch: { works },
})

/** The same, in the GraphQL envelope the client unwraps it from. */
export const catalogueSearchResponse = (works: unknown[]) => ({
  data: catalogueSearchResult(works),
})
