import type { FbsConfig } from "@danskernesdigitalebibliotek/dpl-service-layer";

import { getToken, TOKEN_LIBRARY_KEY } from "../token";
import { getUserToken } from "./helpers/user";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "./reduxMiddleware/extractServiceBaseUrls";

// Bridges /react's redux-backed config into the FbsConfig shape that the
// service-layer expects. Reads the token and base URL at call time so it
// reflects the latest state. Returns null to skip the Authorization header
// when no token is available.
export const buildFbsConfigForReact = (): FbsConfig => ({
  baseUrl: getServiceBaseUrl(serviceUrlKeys.fbs),
  getAuthHeader: () => {
    const token = getUserToken() ?? getToken(TOKEN_LIBRARY_KEY);
    return token ? `Bearer ${token}` : null;
  }
});
