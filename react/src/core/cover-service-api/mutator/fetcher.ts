import FetchFailedError from "../../fetchers/FetchFailedError";
import { getToken, TOKEN_LIBRARY_KEY } from "../../token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../../utils/reduxMiddleware/extractServiceBaseUrls";
import CoverServiceHttpError from "./CoverServiceHttpError";

export const fetcher = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  const libraryToken = getToken(TOKEN_LIBRARY_KEY);
  const authHeaders = libraryToken
    ? ({ Authorization: `Bearer ${libraryToken}` } as object)
    : {};

  const serviceUrl = `${getServiceBaseUrl(serviceUrlKeys.cover)}${url}`;

  try {
    const response = await fetch(serviceUrl, {
      ...init,
      headers: {
        ...init.headers,
        ...authHeaders
      }
    });

    if (!response.ok) {
      throw new CoverServiceHttpError(
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
      // converted to JSON.
      return undefined as T;
    }
  } catch (error: unknown) {
    if (error instanceof CoverServiceHttpError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new FetchFailedError(message, serviceUrl);
  }
};

export default fetcher;

export type ErrorType<ErrorData> = ErrorData & { status: number };

export type BodyType<BodyData> = BodyData & { headers?: unknown };
