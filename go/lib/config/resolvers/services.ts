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
    // The Biblio adapter base url is per-environment Drupal config, not a
    // static url — the ap-service proxy route resolves it from the CMS
    // configuration instead of from this entry.
    biblio: {
      url: null,
      useLibraryTokenAlways: false,
    },
  },
}

export default services
