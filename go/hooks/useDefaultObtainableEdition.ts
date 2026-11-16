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
    // obtainableEditions is newest first, so the first blue hit is the newest
    // blue one. Only results up to that index are awaited.
    combine: results => {
      const newestBlueIndex = obtainableEditions.findIndex((manifestation, index) =>
        isCostFree(manifestation, results[index])
      )
      // A disabled query — physical, or no ISBN — reports isLoading false, so
      // it never blocks the pick.
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
