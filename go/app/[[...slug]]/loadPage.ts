import getQueryClient from "@/lib/getQueryClient"
import { GetPageByPathQuery, useGetPageByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadPage = async (path: string) => {
  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery<GetPageByPathQuery>({
    queryKey: useGetPageByPathQuery.getKey({ path }),
    queryFn: useGetPageByPathQuery.fetcher({ path }),
  })

  return data
}

export default loadPage
