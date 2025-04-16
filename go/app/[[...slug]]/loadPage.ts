import getQueryClient from "@/lib/getQueryClient"
import { GetPageByPathQuery, useGetPageByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getContentQueryPath } from "@/lib/helpers/dpl-cms-content"

const loadPage = async (contentPath: string) => {
  const queryClient = getQueryClient()
  const path = getContentQueryPath(contentPath, "article")

  const data = await queryClient.fetchQuery<GetPageByPathQuery>({
    queryKey: useGetPageByPathQuery.getKey({ path }),
    queryFn: useGetPageByPathQuery.fetcher({ path }),
  })

  return data
}

export default loadPage
