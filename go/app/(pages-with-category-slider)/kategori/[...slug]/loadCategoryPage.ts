import { useGetCategoryPageByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getContentQueryPath } from "@/lib/helpers/dpl-cms-content"

const loadCategoryPage = async (contentPath: string) => {
  const path = getContentQueryPath(contentPath, "category")
  const data = await useGetCategoryPageByPathQuery.fetcher({ path })()

  return data
}

export default loadCategoryPage
