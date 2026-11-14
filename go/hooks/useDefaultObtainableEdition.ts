"use client"

import { useQueries } from "@tanstack/react-query"

import { isPodcastMaterialType } from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { ProductResult } from "@/lib/rest/publizon/adapter/generated/model"
import { getGetV1ProductsIdentifierAdapterQueryOptions } from "@/lib/rest/publizon/adapter/generated/publizon"

// Whether a manifestation is cost-free ("BLÅ"): podcasts always are, an
// online one is whatever Publizon's lookup answers, and a physical one is
// never looked up — Publizon has no catalogue entry for it.
const isCostFree = (
  manifestation: ManifestationWorkPageFragment,
  query: { data?: ProductResult }
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
    // newest blue one. The pick only has to wait for results up to and
    // including that one — an older edition's answer cannot change which
    // one is newest-blue, so it is not worth waiting on.
    combine: results => {
      const newestBlueIndex = obtainableEditions.findIndex((manifestation, index) =>
        isCostFree(manifestation, results[index])
      )
      // `isLoading` is `isPending && isFetching`, so a disabled query — a
      // physical edition, or one with no ISBN — reports false. That is what
      // this needs: an edition that is never looked up can never change the
      // pick, so waiting on it would hang the page on an answer that is not
      // coming.
      const stillDeciding = results
        .slice(0, newestBlueIndex === -1 ? results.length : newestBlueIndex + 1)
        .some(result => result.isLoading)
      return {
        newestBlue: newestBlueIndex === -1 ? undefined : obtainableEditions[newestBlueIndex],
        isLoading: stillDeciding,
      }
    },
  })

  return {
    defaultManifestation: newestBlue ?? obtainableEditions[0],
    isLoading,
  }
}
