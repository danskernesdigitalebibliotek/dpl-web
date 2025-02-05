import { fetcher } from "@/lib/graphql/fetchers/dpl-cms.fetcher"
import {
  GetDplCmsConfigurationDocument,
  GetDplCmsConfigurationQuery,
  GetDplCmsConfigurationQueryVariables,
} from "@/lib/graphql/generated/dpl-cms/graphql"

const queryDplCmsConfig = async () => {
  const { dplConfiguration } = await fetcher<
    GetDplCmsConfigurationQuery,
    GetDplCmsConfigurationQueryVariables
  >(GetDplCmsConfigurationDocument, undefined, {
    next: { revalidate: 30 },
  })()

  return dplConfiguration ?? null
}

export const getDplCmsUniloginConfig = async () => {
  const config = await queryDplCmsConfig()

  return {
    wellknownUrl: process.env.UNILOGIN_WELLKNOWN_URL
      ? process.env.UNILOGIN_WELLKNOWN_URL
      : (config?.unilogin?.unilogin_api_wellknown_url ?? null),
    clientId: process.env.UNILOGIN_CLIENT_ID
      ? process.env.UNILOGIN_CLIENT_ID
      : (config?.unilogin?.unilogin_api_client_id ?? null),
    clientSecret: process.env.UNILOGIN_CLIENT_SECRET
      ? process.env.UNILOGIN_CLIENT_SECRET
      : (config?.unilogin?.unilogin_api_client_secret ?? null),
    apiData: config?.unilogin ?? null,
  }
}
