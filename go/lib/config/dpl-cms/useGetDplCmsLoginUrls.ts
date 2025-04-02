import { useEffect, useState } from "react"

import { GetLoginUrlsQuery, useGetLoginUrlsQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import { getEnv } from "../env"

const queryDplCmsConfig = async () => {
  const { goConfiguration } = await useGetLoginUrlsQuery.fetcher(undefined, {
    // @todo As a part of the caching initiative we should find out what to do here.
    next: { revalidate: 30 },
  })()

  return goConfiguration ?? null
}

export default function useGetDplCmsLoginUrls() {
  const [config, setConfig] = useState<GetLoginUrlsQuery["goConfiguration"] | undefined | null>(
    undefined
  )

  useEffect(() => {
    if (config !== undefined) {
      return
    }

    const fetchData = async () => {
      // If we are running in test mode, we don't want to query the DPL CMS config
      // TODO: The request should interceptet or overwitten by env variable
      const fetchedConfig = getEnv("TEST_MODE") ? null : await queryDplCmsConfig()
      if (fetchedConfig !== null) {
        setConfig(fetchedConfig ?? null)
      }
    }
    fetchData()
  }, [config])

  return { adgangsplatformen: config?.loginUrls?.adgangsplatformen ?? null }
}
