import getQueryClient from "@/lib/getQueryClient"
import { useGetPreviewPageByIddQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadPreviewPage = async ({ id, token }: { id: string; token: string }) => {
  const queryClient = getQueryClient()
  const data = await queryClient.fetchQuery({
    queryKey: useGetPreviewPageByIddQuery.getKey({ id: id, token: token }),
    queryFn: useGetPreviewPageByIddQuery.fetcher({ id: id, token: token }),
  })

  return data
}

export default loadPreviewPage
