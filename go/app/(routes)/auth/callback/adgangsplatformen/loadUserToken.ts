import { z } from "zod"

import getQueryClient from "@/lib/getQueryClient"
import {
  GetAdgangsplatformenUserTokenQuery,
  useGetAdgangsplatformenUserTokenQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { getDplCmsSessionCookie } from "@/lib/session/session"

const loadUserToken = async () => {
  const queryClient = getQueryClient()
  const sessionCookie = await getDplCmsSessionCookie()
  if (!sessionCookie) {
    return null
  }

  try {
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
  } catch {
    return null
  }
}

export default loadUserToken
