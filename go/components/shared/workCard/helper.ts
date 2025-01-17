import {
  GeneralMaterialTypeCodeEnum,
  SearchWithPaginationQuery,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"

export const materialTypeCategories = {
  reading: [
    GeneralMaterialTypeCodeEnum.Articles,
    GeneralMaterialTypeCodeEnum.Books,
    GeneralMaterialTypeCodeEnum.Comics,
    GeneralMaterialTypeCodeEnum.Ebooks,
    GeneralMaterialTypeCodeEnum.ImageMaterials,
    GeneralMaterialTypeCodeEnum.NewspaperJournals,
  ],
  listening: [
    GeneralMaterialTypeCodeEnum.AudioBooks,
    GeneralMaterialTypeCodeEnum.Music,
    GeneralMaterialTypeCodeEnum.SheetMusic,
  ],
  podcast: [GeneralMaterialTypeCodeEnum.Podcasts],
  gaming: [GeneralMaterialTypeCodeEnum.BoardGames, GeneralMaterialTypeCodeEnum.ComputerGames],
  video: [GeneralMaterialTypeCodeEnum.Films, GeneralMaterialTypeCodeEnum.TvSeries],
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
