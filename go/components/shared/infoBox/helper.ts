import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

export const getSeriesInfo = (manifestation: ManifestationWorkPageFragment) => {
  return manifestation.series.map(
    series => `${series.numberInSeries ? series.numberInSeries + " i " : ""}${series.title}`
  )
}
