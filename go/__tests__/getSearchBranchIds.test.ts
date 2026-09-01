import { beforeEach, describe, expect, it, vi } from "vitest"

import { getSearchBranchIds } from "@/lib/actions/getSearchBranchIds"
import { fetcher } from "@/lib/graphql/fetchers/dpl-cms.fetcher"

// getSearchBranchIds resolves the search whitelist server-side via two
// getBranches calls: one with no context (all branches) and one scoped to the
// "search" context (all minus the search blacklist). We mock the CMS fetcher
// and route the response on the availabilityContexts variable.
vi.mock("@/lib/graphql/fetchers/dpl-cms.fetcher", () => ({
  fetcher: vi.fn(),
}))

const mockBranches = ({ all, search }: { all: string[]; search: string[] }) => {
  vi.mocked(fetcher).mockImplementation((_document, variables) => {
    const contexts = (variables as { availabilityContexts?: string[] } | undefined)
      ?.availabilityContexts
    const isilIds = contexts?.includes("search") ? search : all
    return () => Promise.resolve({ getBranches: isilIds.map(isilId => ({ isilId })) })
  })
}

describe("getSearchBranchIds", () => {
  beforeEach(() => {
    vi.mocked(fetcher).mockReset()
  })

  it("returns an empty list when the search blacklist has no effect", async () => {
    // Whitelist still contains every branch → no branchId filter should be
    // applied at all (mirrors react's preferEmptyResult).
    mockBranches({
      all: ["DK-775100", "DK-775120"],
      search: ["DK-775100", "DK-775120"],
    })

    await expect(getSearchBranchIds()).resolves.toEqual([])
  })

  it("returns the whitelisted branches as bare agency numbers when the blacklist narrows the set", async () => {
    mockBranches({
      all: ["DK-775100", "DK-775120", "DK-775122"],
      search: ["DK-775100", "DK-775120"],
    })

    await expect(getSearchBranchIds()).resolves.toEqual(["775100", "775120"])
  })

  it("silently drops whitelisted ISILs that cannot be parsed to an agency number", async () => {
    mockBranches({
      all: ["DK-775100", "DK-775120", "DK-775122"],
      search: ["DK-775100", "INVALID"],
    })

    // "INVALID" has no "-<digits>" segment, so it maps to "" and is filtered
    // out — the search ends up constrained to only the parseable branch.
    await expect(getSearchBranchIds()).resolves.toEqual(["775100"])
  })

  it("returns an empty list when no branches are configured at all", async () => {
    mockBranches({ all: [], search: [] })

    await expect(getSearchBranchIds()).resolves.toEqual([])
  })
})
