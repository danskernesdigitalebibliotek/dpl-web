"use cache"

import { cacheTag } from "next/dist/server/use-cache/cache-tag"

import { useGetCategoriesQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadCategories = async () => {
  const {
    go: { cacheTags },
    ...data
  } = await useGetCategoriesQuery.fetcher()()

  if (cacheTags) {
    // eslint-disable-next-line no-console
    console.log("------- Storing [categories] cacheTags -----", cacheTags)
    cacheTag(...cacheTags)
  }

  return { go: { cacheTags }, ...data }
}

export default loadCategories
