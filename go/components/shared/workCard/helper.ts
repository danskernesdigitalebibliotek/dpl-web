import { GeneralMaterialTypeCode } from "./../../../lib/graphql/generated/fbi/graphql"
import { SearchWithPaginationQuery } from "@/lib/graphql/generated/fbi/graphql"

export const displayCreators = (
  creators: SearchWithPaginationQuery["search"]["works"][0]["creators"],
  amount: number
) => {
  return creators.reduce((acc, creator, index) => {
    // We shorten to max
    if (index === amount) {
      return acc + ", et. al"
    }
    if (index > amount) {
      return acc
    }
    return acc + (index > 0 ? ", " : "") + creator.display
  }, "")
}

const workCategories = {
  reading: [
    GeneralMaterialTypeCode.Articles,
    GeneralMaterialTypeCode.Books,
    GeneralMaterialTypeCode.Comics,
    GeneralMaterialTypeCode.Ebooks,
    GeneralMaterialTypeCode.ImageMaterials,
    GeneralMaterialTypeCode.NewspaperJournals,
  ],
  listening: [
    GeneralMaterialTypeCode.AudioBooks,
    GeneralMaterialTypeCode.Music,
    GeneralMaterialTypeCode.Podcasts,
    GeneralMaterialTypeCode.SheetMusic,
  ],
  gaming: [GeneralMaterialTypeCode.BoardGames, GeneralMaterialTypeCode.ComputerGames],
  video: [GeneralMaterialTypeCode.Films, GeneralMaterialTypeCode.TvSeries],
}

export const isOfWorkTypeCategory = (
  materialTypes: SearchWithPaginationQuery["search"]["works"][0]["materialTypes"],
  category: keyof typeof workCategories
) => {
  return materialTypes.some(materialType =>
    workCategories[category].includes(materialType.materialTypeGeneral.code)
  )
}
