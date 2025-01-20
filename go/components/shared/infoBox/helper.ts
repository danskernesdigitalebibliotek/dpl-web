import {
  getWorkMaterialTypes,
  translateMaterialTypesForRender,
} from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

export const getSeriesInfo = (manifestation: ManifestationWorkPageFragment) => {
  return manifestation.series.map(
    series => `${series.numberInSeries ? series.numberInSeries + " i " : ""}${series.title}`
  )
}

export const getTranslatedMaterialTypes = (manifestation: ManifestationWorkPageFragment) => {
  return getWorkMaterialTypes(manifestation.materialTypes)
    .map(materialType => {
      return translateMaterialTypesForRender({
        value: materialType.code,
        render: materialType.display,
      })
    })
    .map(item => item.render)
}
