import { filter, head, uniqBy } from "lodash"

import { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import goConfig from "@/lib/config/goConfig"
import {
  ManifestationSearchPageTeaserFragment,
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { LibraryProfile, LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import { MaterialTypeIconNamesType } from "@/lib/types/icons"

export const getManifestationMaterialType = (
  manifestation: ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment
) => {
  return manifestation.materialTypes?.[0].materialTypeSpecific
}

const allowedMaterialTypes = [
  "BOOK",
  "EBOOK",
  "BOOK_ELECTRONIC",
  "GRAPHIC_NOVEL",
  "GRAPHIC_NOVEL_ELECTRONIC",
  "GRAPHIC_NOVEL_ONLINE",
  "COMIC",
  "COMIC_ELECTRONIC",
  "COMIC_ONLINE",
  "PICTURE_BOOK",
  "PICTURE_BOOK_ELECTRONIC",
  "PICTURE_BOOK_ONLINE",
  "AUDIO_BOOK_ONLINE",
  "PODCAST",
]
export const hasManifestationAllowedMaterialTypes = (
  manifestation: ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment
) => {
  return manifestation.materialTypes.some(type =>
    allowedMaterialTypes.includes(type.materialTypeSpecific.code)
  )
}

// filter out unallowed material types from manifestations
export const filterMaterialTypes = (
  manifestations: ManifestationWorkPageFragment[] | ManifestationSearchPageTeaserFragment[]
) => {
  const filteredManifestationsMaterialTypes = manifestations.map(manifestation => {
    const filteredMaterialTypes = manifestation.materialTypes.filter(materialType => {
      return allowedMaterialTypes.includes(materialType.materialTypeSpecific.code)
    })
    return {
      ...manifestation,
      materialTypes: filteredMaterialTypes,
    }
  })
  return filteredManifestationsMaterialTypes
}

// TODO: write unit tests for this function
// Exclude manifestations with material types that are not allowed
export const filterManifestationsByMaterialType = (
  manifestations: ManifestationWorkPageFragment[] | ManifestationSearchPageTeaserFragment[]
): (ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment)[] => {
  return filter(manifestations, manifestation => {
    const isAllowedMaterialType = hasManifestationAllowedMaterialTypes(manifestation)
    return isAllowedMaterialType
  })
}

// TODO: write unit tests for this function
// If multiple manifestations share the same material type, keep only the latest edition
export const filterManifestationsByEdition = (
  manifestations: ManifestationWorkPageFragment[] | ManifestationSearchPageTeaserFragment[]
): (ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment)[] => {
  return manifestations.reduce(
    (acc: (ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment)[], current) => {
      const existing = acc.find(
        item =>
          item?.materialTypes?.[0].materialTypeSpecific.code ===
          current?.materialTypes?.[0].materialTypeSpecific.code
      )
      if (!existing) {
        acc.push(current)
      } else {
        const existingEdition = existing.edition?.publicationYear?.year || 0
        const currentEdition = current.edition?.publicationYear?.year || 0
        if (currentEdition > existingEdition) {
          acc = acc.filter(
            item =>
              item?.materialTypes?.[0].materialTypeSpecific.code !==
              current?.materialTypes?.[0].materialTypeSpecific.code
          )
          acc.push(current)
        }
      }
      return acc
    },
    []
  )
}

// Sort manifestations by materialTypeSortPriority
export const sortManifestationsBySortPriority = (
  manifestations: ManifestationWorkPageFragment[] | ManifestationSearchPageTeaserFragment[]
): ManifestationWorkPageFragment[] | ManifestationSearchPageTeaserFragment[] => {
  const sortPriority = goConfig("materialtypes.sortpriority")
  return manifestations.sort((manifestationA, manifestationB) => {
    const priorityA = sortPriority.indexOf(
      manifestationA.materialTypes[0].materialTypeSpecific.code
    )
    const priorityB = sortPriority.indexOf(
      manifestationB.materialTypes[0].materialTypeSpecific.code
    )
    return priorityA - priorityB
  })
}

// If no ebook manifestation is found, return the best representation or a fallback manifestation
export const getEbookManifestationOrFallbackManifestation = (
  bestRepresentation: ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment,
  manifestations: ManifestationWorkPageFragment[] | ManifestationSearchPageTeaserFragment[]
): ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment => {
  const ebookManifestation = manifestations.find(manifestation =>
    isEbookMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  )

  if (ebookManifestation) {
    return ebookManifestation
  }

  return getBestRepresentationOrFallbackManifestation(bestRepresentation, manifestations)
}

// If no best representation is found, return the first manifestation in sortedManifestations
export const getBestRepresentationOrFallbackManifestation = (
  bestRepresentation: ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment,
  manifestations: ManifestationWorkPageFragment[] | ManifestationSearchPageTeaserFragment[]
): ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment => {
  const filteredBestRepresentation = filterManifestationsByMaterialType(
    filterMaterialTypes([bestRepresentation])
  )
  // check if bestRepresentation is located in manifestations
  const isBestRepresentationInManifestations = manifestations.some(
    manifestation => manifestation.pid === bestRepresentation.pid
  )
  // if not, set bestRepresentation to the first manifestation in sortedManifestations
  if (!filteredBestRepresentation.length || !isBestRepresentationInManifestations) {
    return manifestations[0]
  }
  return filteredBestRepresentation[0]
}

const physicalMaterialTypeCodes = ["BOOK", "COMIC", "GRAPHIC_NOVEL", "PICTURE_BOOK"]

const ebookMaterialTypeCodes = [
  "EBOOK",
  "BOOK_ELECTRONIC",
  "COMIC_ONLINE",
  "COMIC_ELECTRONIC",
  "GRAPHIC_NOVEL_ONLINE",
  "GRAPHIC_NOVEL_ELECTRONIC",
  "PICTURE_BOOK_ONLINE",
  "PICTURE_BOOK_ELECTRONIC",
]

const audioMaterialTypeCodes = ["AUDIO_BOOK", "AUDIO_BOOK_ONLINE", "AUDIO_BOOK_ELECTRONIC"]

const podcastMaterialTypeCodes = ["PODCAST"]

export const isPhysicalMaterialType = (code: string): boolean =>
  physicalMaterialTypeCodes.includes(code)

export const isEbookMaterialType = (code: string): boolean => ebookMaterialTypeCodes.includes(code)

export const isAudioMaterialType = (code: string): boolean => audioMaterialTypeCodes.includes(code)

export const isPodcastMaterialType = (code: string): boolean =>
  podcastMaterialTypeCodes.includes(code)

export const getManifestationLabel = (
  manifestation: ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment
): string => {
  const code = manifestation.materialTypes[0]?.materialTypeSpecific.code
  return translateMaterialTypesStringForRender(code)?.toLowerCase() || ""
}

export const getManifestationByMaterialType = (
  work: WorkFullWorkPageFragment,
  materialType: string
): ManifestationWorkPageFragment | undefined => {
  return work.manifestations.all.find(manifestation =>
    manifestation.materialTypes.some(type => type.materialTypeSpecific.display === materialType)
  )
}

export const getManifestationLanguageIsoCode = (manifestation: ManifestationWorkPageFragment) => {
  if (!manifestation) return undefined

  const uniqueLanguagesWithIsoCode = uniqBy(manifestation.languages?.main, "isoCode")

  // We only want to set the lang attribute if there is only one isoCode
  const uniqIsoCode =
    uniqueLanguagesWithIsoCode.length === 1 && head(uniqueLanguagesWithIsoCode)?.isoCode

  if (uniqIsoCode) {
    return uniqIsoCode
  }
  // if there is no isoCode it return undefined so that the lang attribute is not set
  return undefined
}

export const translateMaterialTypesStringForRender = (code: string): string => {
  return goConfig("materialtypes.translations")[code]
}

const iconNameToIconIdentifier: Record<string, MaterialTypeIconNamesType> = {
  book: "book",
  ebook: "ebook",
  comic: "comic",
  comicOnline: "e-comic",
  pictureBook: "picturebook",
  pictureBookOnline: "e-picturebook",
  audioBook: "headphones",
  audioBookOnline: "headphones",
  podcast: "podcast",
}

export const getIconNameFromMaterialType = (
  materialType: string
): MaterialTypeIconNamesType | undefined => {
  const icons = goConfig("materialtypes.icons")

  // Find the icon name that includes this material type
  for (const [iconName, materialTypes] of Object.entries(icons)) {
    if ((materialTypes as string[]).includes(materialType)) {
      return iconNameToIconIdentifier[iconName]
    }
  }

  return undefined
}

export const slideSelectOptionsFromMaterialTypes = (
  workMaterialTypes: { code: string; display: string }[]
) => {
  return workMaterialTypes.map(materialType => {
    return {
      code: materialType.code,
      display: translateMaterialTypesStringForRender(materialType.code),
    }
  }) as SlideSelectOption[]
}

export const getManifestationMaterialTypeIcon = (
  manifestation: ManifestationWorkPageFragment | ManifestationSearchPageTeaserFragment
): MaterialTypeIconNamesType | undefined => {
  const materialType = getManifestationMaterialType(manifestation)
  return getIconNameFromMaterialType(materialType.code)
}

export const canUserLoanMoreMaterials = (
  dataLoans: LoanListResult | null | undefined,
  dataLibraryProfile: LibraryProfile | null | undefined,
  manifestation: ManifestationWorkPageFragment
) => {
  if (!manifestation) {
    return false
  }

  const code = manifestation.materialTypes[0]?.materialTypeSpecific.code
  const icons = goConfig("materialtypes.icons")

  // Check if material is an audiobook
  if ((icons.audioBookOnline as string[]).includes(code)) {
    return !!(
      dataLibraryProfile?.maxConcurrentAudioLoansPerBorrower &&
      dataLoans?.userData?.totalAudioLoans !== undefined &&
      dataLibraryProfile.maxConcurrentAudioLoansPerBorrower > dataLoans.userData.totalAudioLoans
    )
  }

  // Check if material is an ebook
  if ((icons.ebook as string[]).includes(code)) {
    return !!(
      dataLibraryProfile?.maxConcurrentEbookLoansPerBorrower &&
      dataLoans?.userData?.totalEbookLoans !== undefined &&
      dataLibraryProfile.maxConcurrentEbookLoansPerBorrower > dataLoans.userData.totalEbookLoans
    )
  }

  // Podcasts are always loanable, unless user has reached the limit of 30 costFree loans
  if ((icons.podcast as string[]).includes(code)) {
    return canUserLoanMoreCostFreeMaterials(dataLoans)
  }

  // Physical materials and unknown types are not loanable online
  return false
}

export const canUserLoanMoreCostFreeMaterials = (dataLoans: LoanListResult | undefined | null) => {
  // If we can't determine the total costFree loans, we can't determine if the user can loan more
  if (
    dataLoans?.userData?.totalAudioLoans === undefined ||
    dataLoans?.userData?.totalEbookLoans === undefined ||
    dataLoans?.loans === undefined ||
    dataLoans?.loans === null
  ) {
    return false
  }
  // Check if the user has reached a total of 30 costFree loans - if so, no more can be loaned
  const costFreeLoans =
    dataLoans.loans.length -
    (dataLoans.userData.totalAudioLoans + dataLoans.userData.totalEbookLoans)

  return costFreeLoans < 30
}
