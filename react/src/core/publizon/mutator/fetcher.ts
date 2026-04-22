import FetchFailedCriticalError from "../../fetchers/FetchFailedCriticalError";
import { getToken, TOKEN_USER_KEY, TOKEN_LIBRARY_KEY } from "../../token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../../utils/reduxMiddleware/extractServiceBaseUrls";
import { ApiResult } from "../model";
import PublizonServiceError from "./PublizonServiceError";

export const fetcher = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  const token = getToken(TOKEN_USER_KEY) ?? getToken(TOKEN_LIBRARY_KEY);
  const authHeaders = token
    ? ({ Authorization: `Bearer ${token}` } as object)
    : {};

  const serviceUrl = `${getServiceBaseUrl(serviceUrlKeys.publizon)}${url}`;

  try {
    const response = await fetch(serviceUrl, {
      ...init,
      headers: {
        ...init.headers,
        ...authHeaders
      }
    });

    // Json decode the response.
    let data: unknown;
    try {
      data = await response.json();
      if (!response.ok) {
        throw new PublizonServiceError(
          response.status,
          response.statusText,
          data as ApiResult,
          serviceUrl
        );
      }
      // If the response is not JSON, we catch the error and throw a syntax error.
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e;
      }
      data = undefined;
    }

    return data as T;
    // Errors at this point are critical and should be handled by the error boundary.
  } catch (error: unknown) {
    if (error instanceof PublizonServiceError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new FetchFailedCriticalError(message, serviceUrl);
  }
};

export default fetcher;

export type ErrorType<ErrorData> = ErrorData;

export type BodyType<BodyData> = BodyData;
