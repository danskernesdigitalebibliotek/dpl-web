import { createFbsClient } from "@dpl/service-layer/fbs";
import { getToken, TOKEN_LIBRARY_KEY } from "../../token";
import { getUserToken } from "../../utils/helpers/user";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../../utils/reduxMiddleware/extractServiceBaseUrls";

export function getFbsClient() {
  return createFbsClient({
    baseUrl: getServiceBaseUrl(serviceUrlKeys.fbs),
    getAuthHeader: () => {
      const token = getUserToken() ?? getToken(TOKEN_LIBRARY_KEY);
      return token ? `Bearer ${token}` : null;
    }
  });
}
