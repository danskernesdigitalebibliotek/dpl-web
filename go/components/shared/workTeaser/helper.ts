import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getEbookManifestationOrFallbackManifestation,
  sortManifestationsBySortPriority,
} from "@/components/pages/workPageLayout/helper"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

// Picks the manifestation to show and the work page url, the same way
// everywhere a work teaser is listed.
export const getWorkTeaserValues = (
  work: WorkTeaserSearchPageFragment,
  queryParams: Record<string, number | string> = {}
) => {
  const manifestations = sortManifestationsBySortPriority(
    filterManifestationsByEdition(
      filterManifestationsByMaterialType(filterMaterialTypes(work.manifestations.all))
    )
  )
  const manifestation = getEbookManifestationOrFallbackManifestation(
    work.manifestations.bestRepresentation,
    manifestations
  )

  return {
    title: work.titles.full[0],
    creators: work.creators,
    url: manifestation
      ? resolveUrl({
          routeParams: { work: "work", wid: work.workId },
          queryParams: {
            type: manifestation.materialTypes[0].materialTypeSpecific.code,
            ...queryParams,
          },
        })
      : "",
    cover: manifestation?.cover,
    manifestations,
  }
}
