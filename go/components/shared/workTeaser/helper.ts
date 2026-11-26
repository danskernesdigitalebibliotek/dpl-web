import {
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getEbookManifestationOrFallbackManifestation,
  getEditionsForMaterialType,
  sortManifestationsBySortPriority,
  sortManifestationsNewestFirst,
} from "@/components/pages/workPageLayout/helper"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

// Picks the material type to link to and the work page url, the same way
// everywhere a work teaser is listed. Every manifestation of an allowed type
// is passed on, ordered by type priority and then newest first.
// `linkedManifestations` are the ones of the linked type, newest first: the
// work page lands on one of them.
export const getWorkTeaserProps = (
  work: WorkTeaserSearchPageFragment,
  queryParams: Record<string, number | string> = {}
) => {
  const manifestations = sortManifestationsBySortPriority(
    sortManifestationsNewestFirst(
      filterManifestationsByMaterialType(filterMaterialTypes(work.manifestations.all))
    )
  )
  const manifestation = getEbookManifestationOrFallbackManifestation(
    work.manifestations.bestRepresentation,
    manifestations
  )
  const materialTypeCode = manifestation?.materialTypes[0].materialTypeSpecific.code

  return {
    workTitle: work.titles.full[0],
    creators: work.creators,
    url: materialTypeCode
      ? resolveUrl({
          routeParams: { work: "work", wid: work.workId },
          queryParams: { type: materialTypeCode, ...queryParams },
        })
      : "",
    manifestations,
    linkedManifestations: materialTypeCode
      ? getEditionsForMaterialType(work.manifestations.all, materialTypeCode)
      : [],
  }
}
