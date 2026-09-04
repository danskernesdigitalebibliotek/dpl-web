import { type ServiceLayerConfig } from "@danskernesdigitalebibliotek/dpl-service-layer";
import { getToken, TOKEN_USER_KEY, TOKEN_LIBRARY_KEY } from "./token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "./utils/reduxMiddleware/extractServiceBaseUrls";
import { isAnonymous } from "./utils/helpers/user";
import { store } from "./store";

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
  isPatronAuthenticated: !isAnonymous(),
  /**
   * TEMPORARY WORKAROUND - remove when the catalogue and the adapter agree.
   *
   * FBI's catalogue lists digital materials not yet provisioned upstream, and
   * the adapter answers can-loan for those with a 404. With the setting on such
   * a material renders as unavailable instead of taking the material page down
   * through the error boundary - no crash, no falling back to Publizon. Set in
   * the CMS next to the lending flag; an older CMS ships no entry, read as off.
   */
  tolerateUnknownMaterials: () =>
    store.getState().config?.data?.biblioTolerateUnknownMaterialsConfig === "1"
});

export default getServiceLayerConfig;
