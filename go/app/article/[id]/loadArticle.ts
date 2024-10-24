import getQueryClient from "@/lib/getQueryClient"
import { GetArticleQuery, useGetArticleQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadArticle = async (id: string) => {
  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery<GetArticleQuery>({
    queryKey: useGetArticleQuery.getKey({ id }),
    queryFn: useGetArticleQuery.fetcher({ id }),
  })

  return data
}

export default loadArticle
