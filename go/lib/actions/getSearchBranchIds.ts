"use server"

import { fetcher } from "@/lib/graphql/fetchers/dpl-cms.fetcher"
import {
  GetBranchesByContextDocument,
  type GetBranchesByContextQuery,
  type GetBranchesByContextQueryVariables,
} from "@/lib/graphql/generated/dpl-cms/graphql"

// The FBI branchId filter expects the bare agency number (e.g. "775100"), not
// the ISIL id ("DK-775100"). Extract the digits after the hyphen.
const isilToAgencyId = (isilId: string): string => isilId.match(/-(\d+)/)?.[1] ?? ""

const fetchBranchIsils = (availabilityContexts?: string[]): Promise<string[]> =>
  fetcher<GetBranchesByContextQuery, GetBranchesByContextQueryVariables>(
    GetBranchesByContextDocument,
    { availabilityContexts }
  )().then(data => data.getBranches.map(branch => branch.isilId))

// Branch ids to constrain the search to, as agency numbers for the FBI
// branchId filter. Resolved server-side so the CMS GraphQL credentials stay
// off the browser (mirrors getBranchTitle).
//
// Mirrors react's useGetBranches(..., preferEmptyResult): when the "search"
// blacklist has no effect — i.e. the whitelist still contains every branch —
// return an empty list so no branchId filter is applied at all. Only when the
// blacklist actually removes branches do we constrain the search.
export async function getSearchBranchIds(): Promise<string[]> {
  const [allBranchIsils, whitelistedIsils] = await Promise.all([
    fetchBranchIsils(),
    fetchBranchIsils(["search"]),
  ])

  if (whitelistedIsils.length === allBranchIsils.length) {
    return []
  }

  return whitelistedIsils.map(isilToAgencyId).filter(Boolean)
}
