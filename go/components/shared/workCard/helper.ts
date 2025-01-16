import {
  GeneralMaterialTypeCodeEnum,
  SearchWithPaginationQuery,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"

type MaterialTypeCategories = {
  reading: GeneralMaterialTypeCodeEnum[]
  listening: GeneralMaterialTypeCodeEnum[]
  gaming: GeneralMaterialTypeCodeEnum[]
  video: GeneralMaterialTypeCodeEnum[]
}

export const materialTypeCategories: MaterialTypeCategories = {
  reading: ["ARTICLES", "BOOKS", "COMICS", "EBOOKS", "IMAGE_MATERIALS", "NEWSPAPER_JOURNALS"],
  listening: ["AUDIO_BOOKS", "MUSIC", "PODCASTS", "SHEET_MUSIC"],
  gaming: ["BOARD_GAMES", "COMPUTER_GAMES"],
  video: ["FILMS", "TV_SERIES"],
}

export const isOfWorkTypeCategory = (
  materialTypes: SearchWithPaginationQuery["search"]["works"][0]["materialTypes"],
  category: keyof typeof materialTypeCategories
) => {
  return materialTypes.some(materialType =>
    materialTypeCategories[category].includes(materialType.materialTypeGeneral.code)
  )
}

export const getAllWorkPids = (work: WorkTeaserSearchPageFragment) => {
  return work.manifestations.all.map(manifestation => manifestation.pid)
}
