import { type ServiceLayerConfig } from "@danskernesdigitalebibliotek/dpl-service-layer";
import { getToken, TOKEN_USER_KEY, TOKEN_LIBRARY_KEY } from "./token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "./utils/reduxMiddleware/extractServiceBaseUrls";
import { isAnonymous } from "./utils/helpers/user";

/**
 * How the service layer reaches our backends from inside a mounted app.
 *
 * Both resolvers are called per request, not once: base urls arrive through
 * the app's data attributes and land in Redux during render, and the tokens
 * are set by the host before mount.
 */
const getServiceLayerConfig = (): ServiceLayerConfig => ({
  getBaseUrl: (api) => getServiceBaseUrl(serviceUrlKeys[api]),
  getAuthHeader: () => {
    const token = getToken(TOKEN_USER_KEY) ?? getToken(TOKEN_LIBRARY_KEY);
    if (!token) {
      throw new Error("Service layer requests require a token.");
    }
    return `Bearer ${token}`;
  },
  isPatronAuthenticated: !isAnonymous()
});

export default getServiceLayerConfig;
