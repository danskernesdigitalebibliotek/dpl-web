import goConfig from "@/lib/config/goConfig"

import {
  GetPageByPathQuery,
  useGetArticleByPathQuery,
  useGetCategoryPageByPathQuery,
  useGetPageByPathQuery,
} from "../graphql/generated/dpl-cms/graphql"

type TDplCmsContentType = "article" | "page" | "category"

const getContentQueryPath = (path: string, type: TDplCmsContentType) => {
  const pathMap = {
    article: `artikel/${path}`,
    page: `${path}`,
    category: `kategori/${path}`,
  }

  return pathMap[type] ?? path
}

const getContentFetcher = (path: string, type: TDplCmsContentType) => {
  const pathMap = {
    article: useGetArticleByPathQuery,
    page: useGetPageByPathQuery,
    category: useGetCategoryPageByPathQuery,
  }
  const query = pathMap[type]

  if (!query) {
    throw new Error(`No query found for type: ${type}`)
  }

  return query.fetcher({ path })
}

export const getEntityFromPageData = (data: GetPageByPathQuery) =>
  data.route?.__typename === "RouteInternal" ? data.route.entity : undefined

export const loadPageData = async ({
  contentPath,
  type,
}: {
  contentPath: string
  type: TDplCmsContentType
}) => {
  const path = getContentQueryPath(contentPath, type)
  const fetcher = getContentFetcher(path, type)
  const data = await fetcher()

  // Umbrella tag so a single revalidation can drop every cached page. Added
  // here - the one place every page loads through - on top of the per-node
  // tags from the CMS, which stay for targeted invalidation.
  data.go.cacheTags = [...(data.go.cacheTags ?? []), goConfig("caching.dpl-cms.content-tag")]

  return data
}
