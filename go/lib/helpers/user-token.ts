"use server"

import { z } from "zod"

import { useGetAdgangsplatformenUserTokenQuery } from "../graphql/generated/dpl-cms/graphql"
import { getDplCmsSessionCookie } from "../session/session"

export const loadUserToken = async () => {
  const sessionCookie = await getDplCmsSessionCookie()
  if (!sessionCookie) {
    return null
  }

  try {
    const data = await useGetAdgangsplatformenUserTokenQuery.fetcher(undefined, {
      headers: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    })()

    const validateUserToken = z
      .object({
        token: z.string(),
        expire: z.object({
          timestamp: z.number(),
        }),
      })
      .safeParse(data?.dplTokens?.adgangsplatformen?.user)

    if (validateUserToken.error) {
      console.error("loadUserToken error", validateUserToken.error.flatten())
      return null
    }

    return validateUserToken.data
  } catch {
    console.error("Could not load user token.")
    return null
  }
}
