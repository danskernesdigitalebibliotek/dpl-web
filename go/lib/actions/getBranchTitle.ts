"use server"

import { useGetBranchQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

// ISIL -> friendly branch title. Runs server-side so DPL_CMS_BASE_URL and the
// GraphQL basic-auth consumer never reach the browser. The only input is an
// ISIL string, so unlike a generic GraphQL proxy there is nothing a caller can
// use this to exfiltrate.
export async function getBranchTitle(isilId: string): Promise<string | null> {
  if (!isilId) return null
  const data = await useGetBranchQuery.fetcher({ isilId })()
  return data.getBranch?.title ?? null
}
