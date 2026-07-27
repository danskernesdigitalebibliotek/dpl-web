import { getEnv } from "../env"

const services = {
  "services.ap-services": {
    fbi: {
      url: "https://fbi-api.dbc.dk/fbcms-go/graphql",
      useLibraryTokenAlways: false,
    },
    "pubhub-adapter": { url: "https://pubhub-openplatform.dbc.dk", useLibraryTokenAlways: false },
    fbs: {
      // FBS_BASE_URL env override lets tests redirect to mockttp
      // (.env.test sets it to http://localhost:9000).
      url: getEnv("FBS_BASE_URL") ?? "https://fbs-openplatform.dbc.dk",
      useLibraryTokenAlways: false,
    },
  },
}

export default services
