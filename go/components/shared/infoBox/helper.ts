import { Manifestation } from "@/lib/graphql/generated/fbi/graphql"

export const getSeriesInfo = (manifestation: Manifestation) => {
  return manifestation.series.map(
    series => `${series.numberInSeries ? series.numberInSeries + " i " : ""}${series.title}`
  )
}
