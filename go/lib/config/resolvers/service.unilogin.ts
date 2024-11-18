const serviceUnilogin = {
  "service.unilogin.api.url": () => {
    if (process.env.NODE_ENV === "test") {
      return process.env.UNILOGIN_API_URL_TEST
    }
    // if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_url) {
    //   return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_url
    // }
  },
  "service.unilogin.wellknown.url": () => {
    if (process.env.NODE_ENV === "test") {
      return process.env.UNILOGIN_WELLKNOWN_URL_TEST
    }
    // if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_wellknown_url) {
    //   return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_wellknown_url
    // }
  },
  "service.unilogin.client-id": () => {
    if (process.env.NODE_ENV === "test") {
      return process.env.UNILOGIN_CLIENT_ID_TEST
    }
    // if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_id) {
    //   return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_id
    // }
  },
  "service.unilogin.client-secret": () => {
    if (process.env.NODE_ENV === "test") {
      return process.env.UNILOGIN_CLIENT_SECRET_TEST
    }
    // if (uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_secret) {
    //   return uniloginConfiguration?.dplConfiguration?.unilogin?.unilogin_api_client_secret
    // }
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
