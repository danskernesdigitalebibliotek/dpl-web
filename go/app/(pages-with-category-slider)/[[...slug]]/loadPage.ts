import { useGetPageByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getContentQueryPath } from "@/lib/helpers/dpl-cms-content"

const loadPage = async (contentPath: string) => {
  const path = getContentQueryPath(contentPath, "page")
  const data = await useGetPageByPathQuery.fetcher({ path })()

  return data
}

export default loadPage
