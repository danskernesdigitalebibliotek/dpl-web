"use server"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

import { DPL_CMS_CONTENT_CACHE_TAG } from "@/lib/config/dpl-cms/cacheTags"
import { useGetCategoriesQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadCategories = async () => {
  "use cache"
  // Umbrella tag so a single revalidation can drop every cached page. The
  // per-node tags below stay for targeted, per-content invalidation.
  cacheTag(DPL_CMS_CONTENT_CACHE_TAG)

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
