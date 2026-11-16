import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { MaterialTypeIconNamesType } from "@/lib/types/icons"

export type TWorkCardMaterialType = {
  iconName: MaterialTypeIconNamesType
  isCostFree: boolean
}

// One entry per material type icon. Podcasts are always cost-free, other
// types when Publizon says so for any of their manifestations.
export const getWorkCardMaterialTypes = (
  manifestations: ManifestationSearchPageTeaserFragment[],
  isCostFree: (index: number) => boolean = () => false
): TWorkCardMaterialType[] => {
  const materialTypes = new Map<MaterialTypeIconNamesType, boolean>()

  manifestations.forEach((manifestation, index) => {
    const materialType = manifestation.materialTypes[0].materialTypeSpecific.code
    const iconName = getIconNameFromMaterialType(materialType) || "book"
    const costFree = isCostFree(index) || materialType === "PODCAST"
    materialTypes.set(iconName, Boolean(materialTypes.get(iconName)) || costFree)
  })

  return Array.from(materialTypes, ([iconName, isCostFree]) => ({ iconName, isCostFree }))
}
