import { describe, expect, it, vi } from "vitest"

import { useGetAdgangsplatformenUserTokenQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import { loadUserToken } from "@/lib/helpers/user-token"
import { getDplCmsSessionCookie } from "@/lib/session/session"

vi.mock("@/lib/session/session", () => ({
  getDplCmsSessionCookie: vi.fn(),
}))

vi.mock("@/lib/graphql/generated/dpl-cms/graphql", () => ({
  useGetAdgangsplatformenUserTokenQuery: { fetcher: vi.fn() },
}))

const mockTokenResponse = (timestamp: number) => {
  vi.mocked(getDplCmsSessionCookie).mockResolvedValue({ name: "SSESS123", value: "abc" })
  vi.mocked(useGetAdgangsplatformenUserTokenQuery.fetcher).mockReturnValue(() =>
    Promise.resolve({
      dplTokens: {
        adgangsplatformen: { user: { token: "user-token", expire: { timestamp } } },
      },
    })
  )
}

describe("loadUserToken", () => {
  it("returns the token when it has not expired", async () => {
    const future = Math.floor(Date.now() / 1000) + 3600
    mockTokenResponse(future)

    expect(await loadUserToken()).toEqual({ token: "user-token", expire: { timestamp: future } })
  })

  // The CMS returns the token stored at login verbatim and never renews it.
  // An expired token must be treated as no token — otherwise the middleware
  // would resurrect the dead session from the long-lived Drupal session.
  it("returns null when the token has expired", async () => {
    mockTokenResponse(Math.floor(Date.now() / 1000) - 60)

    expect(await loadUserToken()).toBeNull()
  })

  it("returns null when there is no dpl-cms session cookie", async () => {
    vi.mocked(getDplCmsSessionCookie).mockResolvedValue(null)

    expect(await loadUserToken()).toBeNull()
  })
})
