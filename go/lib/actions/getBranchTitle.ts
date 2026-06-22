"use server"

import { fetcher } from "@/lib/graphql/fetchers/dpl-cms.fetcher"
import {
  GetBranchDocument,
  type GetBranchQuery,
  type GetBranchQueryVariables,
} from "@/lib/graphql/generated/dpl-cms/graphql"

// ISIL -> branch title, server-side so credentials stay off the browser
export async function getBranchTitle(isilId: string): Promise<string | null> {
  if (!isilId) return null
  const data = await fetcher<GetBranchQuery, GetBranchQueryVariables>(GetBranchDocument, {
    isilId,
  })()
  return data.getBranch?.title ?? null
}
