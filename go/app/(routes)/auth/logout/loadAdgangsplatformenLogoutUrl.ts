import { z } from "zod"

import { useGetLogoutUrlsQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadAdgangsplatformenLogoutUrl = async () => {
  try {
    const { goConfiguration } = await useGetLogoutUrlsQuery.fetcher()()
    const validateLogoutUrl = z
      .object({
        adgangsplatformen: z.string(),
      })
      .safeParse(goConfiguration?.public?.logoutUrls)

    if (validateLogoutUrl.error) {
      return null
    }

    return new URL(validateLogoutUrl.data.adgangsplatformen)
  } catch {
    return null
  }
}

export default loadAdgangsplatformenLogoutUrl
