import { z } from "zod"

import { useGetAdgangsplatformenUserTokenQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import { getDplCmsSessionCookie } from "@/lib/session/session"

const loadUserToken = async () => {
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
