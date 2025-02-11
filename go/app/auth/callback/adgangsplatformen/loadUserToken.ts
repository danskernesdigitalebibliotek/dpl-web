import { cookies } from "next/headers"
import { z } from "zod"

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
      headers: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    }),
    initialData: {},
    staleTime: 0,
  })

  const validateUserToken = z
    .object({
      token: z.string(),
      expire: z.number(),
    })
    .safeParse(data?.dplTokens?.adgangsplatformen?.user)

  if (validateUserToken.error) {
    return null
  }

  return validateUserToken.data
}

export default loadUserToken
