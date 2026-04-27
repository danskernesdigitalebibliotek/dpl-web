import FetchFailedError from "../../fetchers/FetchFailedError";
import { getToken, TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../../utils/reduxMiddleware/extractServiceBaseUrls";
import DplCmsServiceHttpError from "./DplCmsServiceHttpError";

export const fetcher = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  const token = getToken(TOKEN_USER_KEY) ?? getToken(TOKEN_LIBRARY_KEY);

  const authHeaders = token
    ? ({ Authorization: `Bearer ${token}` } as object)
    : {};

  const serviceUrl = `${getServiceBaseUrl(serviceUrlKeys.dplCms)}${url}`;

  try {
    const response = await fetch(serviceUrl, {
      ...init,
      headers: {
        ...init.headers,
        ...authHeaders
      }
    });

    if (!response.ok) {
      throw new DplCmsServiceHttpError(
        response.status,
        response.statusText,
        serviceUrl
      );
    }

    try {
      return (await response.json()) as T;
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e;
      }
      // Some responses are intentionally empty and thus cannot be
      // converted to JSON. We swallow syntax errors during decoding.
      return undefined as T;
    }
  } catch (error: unknown) {
    if (error instanceof DplCmsServiceHttpError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new FetchFailedError(message, serviceUrl);
  }
};

export default fetcher;

export type ErrorType<ErrorData> = ErrorData;

export type BodyType<BodyData> = BodyData;
