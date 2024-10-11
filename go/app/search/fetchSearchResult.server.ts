import { useSearchWithPaginationQuery } from '@/lib/graphql/generated/fbi/graphql'
import getQueryClient from '@/lib/getQueryClient'

const prefetchSearchResult = async (q: string) => {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      q: { all: q },
      offset: 0,
      limit: 10
    }),
    queryFn: useSearchWithPaginationQuery.fetcher({
      q: { all: q },
      offset: 0,
      limit: 10
    })
  })

  return queryClient
}

export default prefetchSearchResult
