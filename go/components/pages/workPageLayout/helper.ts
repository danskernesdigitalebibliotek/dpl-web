import { head, uniqBy } from "lodash"

import { materialTypeCategories } from "@/components/shared/workCard/helper"
import {
  GeneralMaterialTypeCodeEnum,
  Manifestation,
  ManifestationWorkPageFragment,
  Work,
  WorkFullWorkPageFragment,
  WorkMaterialTypesFragment,
} from "@/lib/graphql/generated/fbi/graphql"

export const getWorkMaterialTypes = (
  materialTypes: Work["materialTypes"]
): Manifestation["materialTypes"][0]["materialTypeGeneral"][] => {
  return materialTypes.map(materialType => materialType.materialTypeGeneral)
}

export const getManifestationMaterialType = (
  manifestation: ManifestationWorkPageFragment
): WorkMaterialTypesFragment["materialTypes"][0]["materialTypeGeneral"]["display"] => {
  return manifestation.materialTypes[0].materialTypeGeneral.display
}

export const getManifestationByMaterialType = (
  work: WorkFullWorkPageFragment,
  materialType: GeneralMaterialTypeCodeEnum[0]
): ManifestationWorkPageFragment | undefined => {
  return work.manifestations.all.find(manifestation =>
    manifestation.materialTypes.some(type => type.materialTypeGeneral.display === materialType)
  )
}

const isManifestationOfMaterialType = (
  manifestation: ManifestationWorkPageFragment,
  materialType: GeneralMaterialTypeCodeEnum
) => {
  return manifestation.materialTypes.some(type => type.materialTypeGeneral.code === materialType)
}

export const isManifestationEbook = (manifestation: ManifestationWorkPageFragment) => {
  if (!manifestation) return false
  return isManifestationOfMaterialType(manifestation, GeneralMaterialTypeCodeEnum.Ebooks)
}

export const isManifestationAudioBook = (manifestation: ManifestationWorkPageFragment) => {
  if (!manifestation) return false
  return isManifestationOfMaterialType(manifestation, GeneralMaterialTypeCodeEnum.AudioBooks)
}

export const isManifestationPodcast = (manifestation: ManifestationWorkPageFragment) => {
  if (!manifestation) return false
  return isManifestationOfMaterialType(manifestation, GeneralMaterialTypeCodeEnum.Podcasts)
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

export const materialTypeSortPriority = [
  GeneralMaterialTypeCodeEnum.Books,
  GeneralMaterialTypeCodeEnum.Ebooks,
  GeneralMaterialTypeCodeEnum.AudioBooks,
  GeneralMaterialTypeCodeEnum.Podcasts,
  GeneralMaterialTypeCodeEnum.BoardGames,
  GeneralMaterialTypeCodeEnum.Articles,
  GeneralMaterialTypeCodeEnum.Comics,
  GeneralMaterialTypeCodeEnum.ComputerGames,
  GeneralMaterialTypeCodeEnum.Films,
  GeneralMaterialTypeCodeEnum.ImageMaterials,
  GeneralMaterialTypeCodeEnum.Music,
  GeneralMaterialTypeCodeEnum.NewspaperJournals,
  GeneralMaterialTypeCodeEnum.Other,
  GeneralMaterialTypeCodeEnum.SheetMusic,
  GeneralMaterialTypeCodeEnum.TvSeries,
]

export const materialTypeTranslations = {
  [GeneralMaterialTypeCodeEnum.Articles]: "Artikel",
  [GeneralMaterialTypeCodeEnum.Books]: "Bog",
  [GeneralMaterialTypeCodeEnum.Comics]: "Tegneserie",
  [GeneralMaterialTypeCodeEnum.Ebooks]: "E-bog",
  [GeneralMaterialTypeCodeEnum.ImageMaterials]: "Billedmateriale",
  [GeneralMaterialTypeCodeEnum.NewspaperJournals]: "Avis",
  [GeneralMaterialTypeCodeEnum.AudioBooks]: "Lydbog",
  [GeneralMaterialTypeCodeEnum.Music]: "Musik",
  [GeneralMaterialTypeCodeEnum.Podcasts]: "Podcast",
  [GeneralMaterialTypeCodeEnum.SheetMusic]: "Noder",
  [GeneralMaterialTypeCodeEnum.BoardGames]: "Brætspil",
  [GeneralMaterialTypeCodeEnum.ComputerGames]: "Computerspil",
  [GeneralMaterialTypeCodeEnum.Films]: "Film",
  [GeneralMaterialTypeCodeEnum.TvSeries]: "Tv-serie",
  [GeneralMaterialTypeCodeEnum.Other]: "Andet",
}

export const translateMaterialTypesStringForRender = (
  code: GeneralMaterialTypeCodeEnum
): string => {
  return materialTypeTranslations[code]
}

export const getIconNameFromMaterialType = (materialType: GeneralMaterialTypeCodeEnum) => {
  const code = materialType
  if (materialTypeCategories.reading.includes(code)) {
    return "book"
  }
  if (materialTypeCategories.listening.includes(code)) {
    return "headphones"
  }
  if (materialTypeCategories.gaming.includes(code)) {
    return "controller"
  }
  if (materialTypeCategories.video.includes(code)) {
    return "video"
  }
  if (materialTypeCategories.podcast.includes(code)) {
    return "podcast"
  }
}
