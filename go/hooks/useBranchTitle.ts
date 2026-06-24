"use client"

import { useQuery } from "@tanstack/react-query"

import { branchTitleQueryKey } from "@/hooks/useBranchTitle.keys"
import { getBranchTitle } from "@/lib/actions/getBranchTitle"

// Reactive ISIL -> branch title, backed by the getBranchTitle server action.
// Replaces the browser-side CMS GraphQL query so no GraphQL passthrough is
// exposed to the client. Disabled until an ISIL is known; branch names are
// effectively static, hence staleTime: Infinity.
export const useBranchTitle = (isilId: string | undefined) =>
  useQuery({
    queryKey: branchTitleQueryKey(isilId ?? ""),
    queryFn: () => getBranchTitle(isilId ?? ""),
    enabled: !!isilId,
    staleTime: Infinity,
  })
