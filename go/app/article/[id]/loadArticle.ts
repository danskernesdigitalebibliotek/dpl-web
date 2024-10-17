import { GetArticleQuery, useGetArticleQuery } from "@/lib/generated/graphql/dpl-cms/graphql"
import getQueryClient from "@/lib/getQueryClient"

const loadArticle = async (id: string) => {
  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery<GetArticleQuery>({
    queryKey: useGetArticleQuery.getKey({ id }),
    queryFn: useGetArticleQuery.fetcher({ id }),
  })

  return data
}

export default loadArticle
