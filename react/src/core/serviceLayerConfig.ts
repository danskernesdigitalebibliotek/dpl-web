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
   * During the transition FBI's catalogue lists digital materials that are
   * not yet provisioned upstream, and the adapter answers can-loan for those
   * with a 404 ("Material not found"). With errors surfaced, that takes the
   * error boundary - and the whole material page - down for a material the
   * library simply cannot lend yet. With the setting on, such a material is
   * rendered as unavailable instead: no crash, no falling back to Publizon.
   *
   * Set in the CMS next to the lending flag, shipped to every app as
   * data-biblio-tolerate-unknown-materials-config - the CMS' attribute name,
   * not ours to rename from here. Read per call like the other resolvers:
   * the config lands in Redux during render, after this object is built. An
   * older CMS release ships no such entry, which reads as off.
   */
  tolerateUnknownMaterials: () =>
    store.getState().config?.data?.biblioTolerateUnknownMaterialsConfig === "1"
});

export default getServiceLayerConfig;
