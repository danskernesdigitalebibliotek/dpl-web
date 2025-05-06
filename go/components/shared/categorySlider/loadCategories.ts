import getQueryClient from "@/lib/getQueryClient"
import { GetCategoriesQuery, useGetCategoriesQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadCategories = async () => {
  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery<GetCategoriesQuery>({
    queryKey: useGetCategoriesQuery.getKey(),
    queryFn: useGetCategoriesQuery.fetcher(),
  })

  return data
}

export default loadCategories
