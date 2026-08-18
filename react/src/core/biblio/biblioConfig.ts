import { type BiblioConfig } from "@danskernesdigitalebibliotek/dpl-service-layer";
import { getToken, TOKEN_USER_KEY, TOKEN_LIBRARY_KEY } from "../token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../utils/reduxMiddleware/extractServiceBaseUrls";

const getBiblioConfig = (): BiblioConfig => {
  return {
    baseUrl: getServiceBaseUrl(serviceUrlKeys.biblio),
    getAuthHeader: () => {
      const token = getToken(TOKEN_USER_KEY) ?? getToken(TOKEN_LIBRARY_KEY);
      if (!token) {
        throw new Error("Biblio requests require a token.");
      }
      return `Bearer ${token}`;
    }
  };
};

export default getBiblioConfig;
