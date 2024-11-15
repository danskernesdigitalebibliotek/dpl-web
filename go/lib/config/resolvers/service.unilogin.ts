import { QueryClient } from "@tanstack/react-query"

import {
  GetUniLoginConfigurationQuery,
  useGetUniLoginConfigurationQuery,
} from "@/lib/graphql/generated/dpl-cms/graphql"

export let uniloginConfiguration: GetUniLoginConfigurationQuery | undefined

export const initUniLoginConfiguration = async (queryClient: QueryClient) => {
  if (uniloginConfiguration) return uniloginConfiguration

  const data = await queryClient.ensureQueryData<GetUniLoginConfigurationQuery>({
    queryKey: useGetUniLoginConfigurationQuery.getKey(),
    queryFn: useGetUniLoginConfigurationQuery.fetcher(),
  })

  uniloginConfiguration = data
  return data
}

const serviceUnilogin = {
  "service.unilogin.api.url": () => {
    if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_url) {
      return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_url
    }
  },
  "service.unilogin.wellknown.url": () => {
    if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_wellknown_url) {
      return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_wellknown_url
    }
  },
  "service.unilogin.client-id": () => {
    if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_id) {
      return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_id
    }
  },
  "service.unilogin.client-secret": () => {
    if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_secret) {
      return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_secret
    }
  },
  "service.unilogin.basic-auth.header": () => {
    if (process.env.UNILOGIN_BASIC_AUTH_HEADER) {
      return process.env.UNILOGIN_BASIC_AUTH_HEADER
    }
  },
  "service.unilogin.refresh-token.url": () => {
    if (process.env.UNILOGIN_REFRESH_TOKEN_URL) {
      return process.env.UNILOGIN_REFRESH_TOKEN_URL
    }
  },
  "service.unilogin.session.secret": () => {
    if (process.env.UNILOGIN_SESSION_SECRET) {
      return process.env.UNILOGIN_SESSION_SECRET
    }
  },
}

export default serviceUnilogin
