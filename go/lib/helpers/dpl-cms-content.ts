import { GetPageByPathQuery } from "../graphql/generated/dpl-cms/graphql"

type TDplCmsContentType = "article" | "page" | "category"

export const getContentQueryPath = (path: string, type: TDplCmsContentType) => {
  const pathMap = {
    article: `artikel/${path}`,
    page: `${path}`,
    category: `kategori/${path}`,
  }

  return pathMap[type] ?? path
}

export const getEntityFromPageData = (data: GetPageByPathQuery) =>
  data.route?.__typename === "RouteInternal" ? data.route.entity : undefined
