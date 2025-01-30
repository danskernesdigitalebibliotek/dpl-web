import { cookies } from "next/headers"

import getQueryClient from "@/lib/getQueryClient"
import {
  GetAdgangsplatformenUserTokenQuery,
  useGetAdgangsplatformenUserTokenQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const loadUserToken = async () => {
  const queryClient = getQueryClient()

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const sessionCookie = allCookies.find(cookie => cookie.name.startsWith("SSESS"))
  if (!sessionCookie) {
    return null
  }

  const data = await queryClient.fetchQuery<GetAdgangsplatformenUserTokenQuery>({
    queryKey: useGetAdgangsplatformenUserTokenQuery.getKey(),
    queryFn: useGetAdgangsplatformenUserTokenQuery.fetcher(undefined, {
      Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
    }),
    initialData: {},
    staleTime: 0,
  })

  if (!data?.dplTokens?.adgangsplatformen?.user) {
    return null
  }

  return data.dplTokens.adgangsplatformen.user
}

export default loadUserToken
