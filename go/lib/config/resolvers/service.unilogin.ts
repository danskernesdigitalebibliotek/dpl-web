const serviceUnilogin = {
  "service.unilogin.api.url": () => {
    if (process.env.UNILOGIN_API_URL) {
      return process.env.UNILOGIN_API_URL
    }
  },
  "service.unilogin.wellknown.url": () => {
    if (process.env.UNILOGIN_WELKNOWN_URL) {
      return process.env.UNILOGIN_WELKNOWN_URL
    }
  },
  "service.unilogin.refresh-token.url": () => {
    if (process.env.UNILOGIN_REFRESH_TOKEN_URL) {
      return process.env.UNILOGIN_REFRESH_TOKEN_URL
    }
  },
  "service.unilogin.client-id": () => {
    if (process.env.UNILOGIN_CLIENT_ID) {
      return process.env.UNILOGIN_CLIENT_ID
    }
  },
  "service.unilogin.client-secret": () => {
    if (process.env.UNILOGIN_CLIENT_SECRET) {
      return process.env.UNILOGIN_CLIENT_SECRET
    }
  },
  "service.unilogin.session.secret": () => {
    if (process.env.UNILOGIN_SESSION_SECRET) {
      return process.env.UNILOGIN_SESSION_SECRET
    }
  },
}

export default serviceUnilogin
