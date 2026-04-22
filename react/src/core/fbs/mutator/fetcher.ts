import FetchFailedCriticalError from "../../fetchers/FetchFailedCriticalError";
import { getToken, TOKEN_LIBRARY_KEY } from "../../token";
import { getUserToken } from "../../utils/helpers/user";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../../utils/reduxMiddleware/extractServiceBaseUrls";
import FbsServiceHttpError from "./FbsServiceHttpError";

export const fetcher = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  const token = getUserToken() ?? getToken(TOKEN_LIBRARY_KEY);
  const baseUrl = getServiceBaseUrl(serviceUrlKeys.fbs);

  const authHeaders = token
    ? ({ Authorization: `Bearer ${token}` } as object)
    : {};

  const serviceUrl = `${baseUrl}${url}`;

  try {
    const response = await fetch(serviceUrl, {
      ...init,
      headers: {
        ...init.headers,
        ...authHeaders
      }
    });

    if (!response.ok) {
      throw new FbsServiceHttpError(
        response.status,
        response.statusText,
        serviceUrl
      );
    }

    const text = await response.text();
    // Some of our responses are intentionally empty. Only try to convert non-empty responses to JSON.
    return (text ? JSON.parse(text) : undefined) as T;
  } catch (error: unknown) {
    if (error instanceof FbsServiceHttpError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new FetchFailedCriticalError(message, serviceUrl);
  }
};

export default fetcher;

export type ErrorType<ErrorData> = ErrorData;

export type BodyType<BodyData> = BodyData;
