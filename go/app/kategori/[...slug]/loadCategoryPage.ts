import getQueryClient from "@/lib/getQueryClient"
import {
  GetCategoryPageByPathQuery,
  useGetCategoryPageByPathQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const loadCategoryPage = async (path: string) => {
  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery<GetCategoryPageByPathQuery>({
    queryKey: useGetCategoryPageByPathQuery.getKey({ path }),
    queryFn: useGetCategoryPageByPathQuery.fetcher({ path }),
  })

  return data
}

export default loadCategoryPage
