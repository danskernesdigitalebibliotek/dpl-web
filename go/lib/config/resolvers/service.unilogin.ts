import { getDplCmsUniloginConfig } from "../dpl-cms/dplCmsConfig"

const serviceUnilogin = {
  "service.unilogin.api.url": async () => {
    if (process.env.UNILOGIN_API_URL) {
      return process.env.UNILOGIN_API_URL
    }

    const config = await getDplCmsUniloginConfig()
    if (config?.unilogin_api_url) {
      return config?.unilogin_api_url
    }
  },
  "service.unilogin.wellknown.url": async () => {
    if (process.env.UNILOGIN_WELLKNOWN_URL) {
      return process.env.UNILOGIN_WELLKNOWN_URL
    }

    const config = await getDplCmsUniloginConfig()
    if (config?.unilogin_api_wellknown_url) {
      return config?.unilogin_api_wellknown_url
    }
  },
  "service.unilogin.client-id": async () => {
    if (process.env.UNILOGIN_CLIENT_ID) {
      return process.env.UNILOGIN_CLIENT_ID
    }

    const config = await getDplCmsUniloginConfig()
    if (config?.unilogin_api_client_id) {
      return config?.unilogin_api_client_id
    }
  },
  "service.unilogin.client-secret": async () => {
    if (process.env.UNILOGIN_CLIENT_SECRET) {
      return process.env.UNILOGIN_CLIENT_SECRET
    }

    const config = await getDplCmsUniloginConfig()
    if (config?.unilogin_api_client_secret) {
      return config?.unilogin_api_client_secret
    }
  },
  "service.unilogin.session.secret": () => {
    if (process.env.UNILOGIN_SESSION_SECRET) {
      return process.env.UNILOGIN_SESSION_SECRET
    }
  },
}

export default serviceUnilogin
