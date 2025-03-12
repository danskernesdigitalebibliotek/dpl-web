import getQueryClient from "@/lib/getQueryClient"
import {
  GetArticleByPathQuery,
  useGetArticleByPathQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const loadArticle = async (path: string) => {
  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery<GetArticleByPathQuery>({
    queryKey: useGetArticleByPathQuery.getKey({ path }),
    queryFn: useGetArticleByPathQuery.fetcher({ path }),
  })

  return data
}

export default loadArticle
