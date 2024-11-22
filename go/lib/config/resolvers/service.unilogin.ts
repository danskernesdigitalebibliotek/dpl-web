import { withUniloginConfig } from "../dpl-cms/dplCmsConfig"

const serviceUnilogin = {
  "server-only.service.unilogin.api.url": withUniloginConfig(config => {
    if (process.env.UNILOGIN_API_URL) {
      return process.env.UNILOGIN_API_URL
    }
    if (config?.unilogin_api_url) {
      return config?.unilogin_api_url
    }
  }),
  "server-only.service.unilogin.wellknown.url": withUniloginConfig(config => {
    if (process.env.UNILOGIN_WELLKNOWN_URL) {
      return process.env.UNILOGIN_WELLKNOWN_URL
    }
    if (config?.unilogin_api_wellknown_url) {
      return config?.unilogin_api_wellknown_url
    }
  }),
  "server-only.service.unilogin.client-id": withUniloginConfig(config => {
    if (process.env.UNILOGIN_CLIENT_ID) {
      return process.env.UNILOGIN_CLIENT_ID
    }
    if (config?.unilogin_api_client_id) {
      return config?.unilogin_api_client_id
    }
  }),
  "server-only.service.unilogin.client-secret": withUniloginConfig(config => {
    if (process.env.UNILOGIN_CLIENT_SECRET) {
      return process.env.UNILOGIN_CLIENT_SECRET
    }
    if (config?.unilogin_api_client_secret) {
      return config?.unilogin_api_client_secret
    }
  }),
  "server-only.service.unilogin.session.secret": () => {
    if (process.env.UNILOGIN_SESSION_SECRET) {
      return process.env.UNILOGIN_SESSION_SECRET
    }
  },
}

export default serviceUnilogin
