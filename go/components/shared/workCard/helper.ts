import { flatten } from "lodash"

import { Cover } from "@/lib/cover-service-api/model"
import { SearchWithPaginationQuery, WorkTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { filterFalsyValuesFromArray } from "@/lib/helpers/general"

import { CoverImageUrls } from "./../../../lib/cover-service-api/model/coverImageUrls"
import { GeneralMaterialTypeCode } from "./../../../lib/graphql/generated/fbi/graphql"

export const displayCreators = (
  creators: SearchWithPaginationQuery["search"]["works"][0]["creators"],
  amount: number
) => {
  return creators.reduce((acc, creator, index) => {
    // We shorten to max <amount> creators
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

export const getAllWorkPids = (work: WorkTeaserFragment) => {
  return work.manifestations.all.map(manifestation => manifestation.pid)
}

const removeEmptyCovers = (coverData: Cover[], sizes: (keyof CoverImageUrls)[]) => {
  return coverData.filter((cover: Cover) => {
    return sizes.map(size => cover.imageUrls?.[size]?.url)
  })
}

export const getCoverUrls = (
  data: Cover[] | null | undefined,
  pids: string[],
  sizes: (keyof CoverImageUrls)[]
) => {
  if (!data || pids.length === 0) {
    return null
  }
  // Make sure we only have covers in our data that has a url in the given size.
  const covers = removeEmptyCovers(data, sizes)

  // Get covers that have same id as the best representation id.
  const matchingPidCovers = covers.filter((cover: Cover) => {
    if (!cover.id) {
      return false
    }
    return pids.includes(cover.id)
  })

  // Get covers that have a size url for given sizes.
  const matchingSizeAndPidCovers = matchingPidCovers.filter(cover => {
    return sizes.map(size => cover.imageUrls?.[size]?.url)
  })

  const coverUrls = flatten(
    matchingSizeAndPidCovers.map(cover => {
      if (!cover.imageUrls) {
        return
      }
      return sizes.map(size => {
        if (!!cover?.imageUrls?.[size]?.url) return cover.imageUrls[size].url
      })
    })
  )

  return filterFalsyValuesFromArray(coverUrls)
}
