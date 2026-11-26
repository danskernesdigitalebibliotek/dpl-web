import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { MaterialTypeIconNamesType } from "@/lib/types/icons"

export type TWorkCardMaterialType = {
  iconName: MaterialTypeIconNamesType
  isCostFree: boolean
}

// One entry per material type icon, cost-free when any of its manifestations
// is.
export const getWorkCardMaterialTypes = (
  manifestations: ManifestationSearchPageTeaserFragment[],
  isCostFree: (manifestation: ManifestationSearchPageTeaserFragment) => boolean
): TWorkCardMaterialType[] => {
  const materialTypes = new Map<MaterialTypeIconNamesType, boolean>()

  manifestations.forEach(manifestation => {
    const materialType = manifestation.materialTypes.at(0)?.materialTypeSpecific.code
    const iconName = (materialType && getIconNameFromMaterialType(materialType)) || "book"
    materialTypes.set(iconName, Boolean(materialTypes.get(iconName)) || isCostFree(manifestation))
  })

  return Array.from(materialTypes, ([iconName, isCostFree]) => ({ iconName, isCostFree }))
}
