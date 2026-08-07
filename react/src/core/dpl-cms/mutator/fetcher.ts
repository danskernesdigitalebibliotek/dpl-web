import FetchFailedError from "../../fetchers/FetchFailedError";
import { getToken, TOKEN_LIBRARY_KEY, TOKEN_USER_KEY } from "../../token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../../utils/reduxMiddleware/extractServiceBaseUrls";
import DplCmsServiceHttpError from "./DplCmsServiceHttpError";

export const fetcher = async <ResponseType>(
  url: string,
  options: RequestInit
) => {
  const { headers } = options;

  const token = getToken(TOKEN_USER_KEY) ?? getToken(TOKEN_LIBRARY_KEY);

  const authHeaders = token
    ? ({ Authorization: `Bearer ${token}` } as object)
    : {};

  const baseUrl = getServiceBaseUrl(serviceUrlKeys.dplCms);

  const serviceUrl = `${baseUrl}${url}`;

  try {
    const response = await fetch(serviceUrl, {
      ...options,
      headers: {
        ...headers,
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
      return (await response.json()) as ResponseType;
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e;
      }
    }
  } catch (error: unknown) {
    if (error instanceof DplCmsServiceHttpError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new FetchFailedError(message, serviceUrl);
  }
  // Do nothing. Some of our responses are intentionally empty and thus
  // cannot be converted to JSON. Fetch API and TypeScript has no clean
  // way for us to identify empty responses, so instead we swallow
  // syntax errors during decoding.
  return undefined as ResponseType;
};

export default fetcher;

export type ErrorType<ErrorData> = ErrorData;

export type BodyType<BodyData> = BodyData;
