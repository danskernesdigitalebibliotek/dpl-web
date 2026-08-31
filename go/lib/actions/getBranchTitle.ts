"use server"

import { fetcher } from "@/lib/graphql/fetchers/dpl-cms.fetcher"
import {
  GetBranchesDocument,
  type GetBranchesQuery,
  type GetBranchesQueryVariables,
} from "@/lib/graphql/generated/dpl-cms/graphql"

// ISIL -> branch title, server-side so credentials stay off the browser.
// getBranches filtered by isilId returns the single matching branch.
export async function getBranchTitle(isilId: string): Promise<string | null> {
  if (!isilId) return null
  const data = await fetcher<GetBranchesQuery, GetBranchesQueryVariables>(GetBranchesDocument, {
    isilId,
  })()
  return data.getBranches[0]?.title ?? null
}
