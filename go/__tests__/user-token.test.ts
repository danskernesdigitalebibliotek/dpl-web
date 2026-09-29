import { describe, expect, it, vi } from "vitest"

import AccessForbiddenError from "@/lib/graphql/fetchers/AccessForbiddenError"
import UnauthenticatedError from "@/lib/graphql/fetchers/UnauthenticatedError"
import {
  GetAdgangsplatformenUserTokenQuery,
  useGetAdgangsplatformenUserTokenQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { loadUserToken } from "@/lib/helpers/user-token"
import { getDplCmsSessionCookie } from "@/lib/session/session"

vi.mock("@/lib/session/session", () => ({
  getDplCmsSessionCookie: vi.fn(),
}))

vi.mock("@/lib/graphql/generated/dpl-cms/graphql", () => ({
  useGetAdgangsplatformenUserTokenQuery: { fetcher: vi.fn() },
}))

const mockCmsResponse = (user: unknown) => {
  vi.mocked(getDplCmsSessionCookie).mockResolvedValue({ name: "SSESS123", value: "abc" })
  vi.mocked(useGetAdgangsplatformenUserTokenQuery.fetcher).mockReturnValue(() =>
    Promise.resolve({
      go: { cacheTags: [] },
      dplTokens: { adgangsplatformen: { user } },
    } as unknown as GetAdgangsplatformenUserTokenQuery)
  )
}

const mockCmsRejection = (error: Error) => {
  vi.mocked(getDplCmsSessionCookie).mockResolvedValue({ name: "SSESS123", value: "abc" })
  vi.mocked(useGetAdgangsplatformenUserTokenQuery.fetcher).mockReturnValue(() =>
    Promise.reject(error)
  )
}

describe("loadUserToken", () => {
  it("returns the token when the CMS hands one out", async () => {
    const timestamp = Math.floor(Date.now() / 1000) + 3600
    mockCmsResponse({ token: "user-token", expire: { timestamp } })

    expect(await loadUserToken()).toEqual({
      status: "token",
      data: { token: "user-token", expire: { timestamp } },
    })
  })

  // Expiry is the CMS's call: its token producer returns nothing once the
  // token has expired.
  it("reports no token when the CMS returns none", async () => {
    mockCmsResponse(null)

    expect(await loadUserToken()).toEqual({ status: "no-token" })
  })

  it("reports no token when there is no dpl-cms session cookie", async () => {
    vi.mocked(getDplCmsSessionCookie).mockResolvedValue(null)

    expect(await loadUserToken()).toEqual({ status: "no-token" })
  })

  // Drupal logs out patrons whose token has expired, so the cookie stops
  // being an authenticated session. That is an answer, not a failure.
  it.each([
    ["401", new UnauthenticatedError("No authentication credentials provided.")],
    ["403", new AccessForbiddenError("Permission required.")],
  ])("reports no token when the CMS refuses the cookie with %s", async (_status, error) => {
    mockCmsRejection(error)

    expect(await loadUserToken()).toEqual({ status: "no-token" })
  })

  // An unreachable CMS says nothing about the patron, so callers must not
  // tear the session down.
  it("reports an error when the CMS cannot be reached", async () => {
    mockCmsRejection(new Error("Failed to fetch data from DPL CMS"))

    expect(await loadUserToken()).toEqual({ status: "error" })
  })

  it("reports an error when the token is malformed", async () => {
    mockCmsResponse({ token: "user-token", expire: { timestamp: "not-a-number" } })

    expect(await loadUserToken()).toEqual({ status: "error" })
  })
})
