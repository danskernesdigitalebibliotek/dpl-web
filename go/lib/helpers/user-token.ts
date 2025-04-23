"use server"

import { z } from "zod"

import getQueryClient from "../getQueryClient"
import {
  GetAdgangsplatformenUserTokenQuery,
  useGetAdgangsplatformenUserTokenQuery,
} from "../graphql/generated/dpl-cms/graphql"
import { getDplCmsSessionCookie } from "../session/session"

export const loadUserToken = async () => {
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
      console.error(validateUserToken.error.flatten)
      return null
    }

    return validateUserToken.data
  } catch {
    console.error("Could not load user token.")
    return null
  }
}
