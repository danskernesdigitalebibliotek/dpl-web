import getQueryClient from "@/lib/getQueryClient"
import {
  GetCategoryPageByPathQuery,
  useGetCategoryPageByPathQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { getContentQueryPath } from "@/lib/helpers/dpl-cms-content"

const loadCategoryPage = async (contentPath: string) => {
  const queryClient = getQueryClient()
  const path = getContentQueryPath(contentPath, "category")

  const data = await queryClient.fetchQuery<GetCategoryPageByPathQuery>({
    queryKey: useGetCategoryPageByPathQuery.getKey({ path }),
    queryFn: useGetCategoryPageByPathQuery.fetcher({ path }),
  })

  return data
}

export default loadCategoryPage
