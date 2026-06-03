import type { FbsConfig } from "@danskernesdigitalebibliotek/dpl-service-layer";

import { getToken, TOKEN_LIBRARY_KEY } from "../token";
import { getUserToken } from "./helpers/user";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "./reduxMiddleware/extractServiceBaseUrls";

// Bridges /react's redux-backed config into the FbsConfig shape that the
// service-layer expects. Both fields are lazy — they read from the redux
// store / token cookies at the moment the service-layer needs them. This
// matters in Storybook and during early app init where the FBS base URL
// isn't populated yet when the provider mounts.
export const buildFbsConfigForReact = (): FbsConfig => ({
  baseUrl: () => getServiceBaseUrl(serviceUrlKeys.fbs),
  getAuthHeader: () => {
    const token = getUserToken() ?? getToken(TOKEN_LIBRARY_KEY);
    return token ? `Bearer ${token}` : null;
  }
});
