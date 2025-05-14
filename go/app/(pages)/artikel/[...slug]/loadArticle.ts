import { useGetArticleByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getContentQueryPath } from "@/lib/helpers/dpl-cms-content"

const loadArticle = async (contentPath: string) => {
  const path = getContentQueryPath(contentPath, "article")
  const data = await useGetArticleByPathQuery.fetcher({ path })()

  return data
}

export default loadArticle
