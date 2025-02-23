import { z } from "zod"

import { useGetLogoutUrlsQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

const loadAdgangsplatformenLogoutUrl = async () => {
  try {
    const { goConfiguration } = await useGetLogoutUrlsQuery.fetcher(undefined, {
      // @todo As a part of the caching initiative we should find out what to do here.
      next: { revalidate: 30 },
    })()
    const validateLogoutUrl = z
      .object({
        adgangsplatformen: z.string(),
      })
      .safeParse(goConfiguration?.logoutUrls)

    if (validateLogoutUrl.error) {
      return null
    }

    return new URL(validateLogoutUrl.data.adgangsplatformen)
  } catch {
    return null
  }
}

export default loadAdgangsplatformenLogoutUrl
