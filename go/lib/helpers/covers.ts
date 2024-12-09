import { flatten } from "lodash"

import { Cover, CoverImageUrls } from "@/lib/rest/cover-service-api/generated/model"

import { filterFalsyValuesFromArray } from "./arrays"

const removeEmptyCovers = (coverData: Cover[], sizes: (keyof CoverImageUrls)[]) => {
  return coverData.filter((cover: Cover) => {
    return sizes.map(size => cover.imageUrls?.[size]?.url)
  })
}

export const getCoverUrls = (
  data: Cover[] | null | undefined,
  pids: string[] | undefined,
  sizes: (keyof CoverImageUrls)[]
) => {
  if (!data || !pids || pids.length === 0) {
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

export const getLowResCoverUrl = (coversArray: Cover[] | null | undefined) => {
  if (!coversArray) {
    return null
  }

  // Get the first cover that has a xx-small image url
  for (const cover of coversArray) {
    const url = cover.imageUrls?.["xx-small"]?.url
    if (url) {
      return url
    }
  }

  return ""
}
