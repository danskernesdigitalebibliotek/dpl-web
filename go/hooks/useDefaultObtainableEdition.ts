"use client"

import { useQueries } from "@tanstack/react-query"

import { isPodcastMaterialType } from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getGetV1ProductsIdentifierAdapterQueryOptions } from "@/lib/rest/publizon/adapter/generated/publizon"

// Whether a manifestation is cost-free ("BLÅ"): podcasts always are, an
// online one is whatever Publizon's lookup answers, and a physical one is
// never looked up — Publizon has no catalogue entry for it.
const isCostFree = (
  manifestation: ManifestationWorkPageFragment,
  query: { data?: { product?: { costFree?: boolean } } }
): boolean =>
  Boolean(
    query.data?.product?.costFree ||
    isPodcastMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  )

// Picks the edition a reader lands on by default: the newest cost-free
// ("BLÅ") one if the kommune has any, otherwise the newest obtainable one.
// One Publizon request per candidate — /v1/products lists the entire
// catalogue with no identifier filter (see getGetV1ProductsAdapterUrl, which
// takes no parameters), so there is no batch lookup to use instead.
// TODO(publizon-sunset): these lookups go away with the Biblio adapter
// migration, see helper.ts:208.
export const useDefaultObtainableEdition = (
  obtainableEditions: ManifestationWorkPageFragment[]
): { defaultManifestation: ManifestationWorkPageFragment | undefined; isLoading: boolean } => {
  const { newestBlue, isLoading } = useQueries({
    queries: obtainableEditions.map(manifestation => {
      const isOnline = manifestation.accessTypes[0]?.code === "ONLINE"
      const isbn = manifestation.identifiers.find(identifier => identifier.type === "ISBN")?.value
      return getGetV1ProductsIdentifierAdapterQueryOptions(isbn ?? "", {
        query: { enabled: isOnline && !!isbn },
      })
    }),
    // obtainableEditions is newest first, so the first blue one found is the
    // newest blue one.
    combine: results => ({
      newestBlue: obtainableEditions.find((manifestation, index) =>
        isCostFree(manifestation, results[index])
      ),
      isLoading: results.some(result => result.isLoading),
    }),
  })

  return {
    defaultManifestation: newestBlue ?? obtainableEditions[0],
    isLoading,
  }
}
