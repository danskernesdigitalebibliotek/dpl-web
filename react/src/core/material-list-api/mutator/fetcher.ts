import FetchFailedError from "../../fetchers/FetchFailedError";
import { getToken, TOKEN_USER_KEY } from "../../token";
import {
  getServiceBaseUrl,
  serviceUrlKeys
} from "../../utils/reduxMiddleware/extractServiceBaseUrls";
import MaterialListServiceHttpError from "./MaterialListServiceHttpError";

export const fetcher = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  const userToken = getToken(TOKEN_USER_KEY);
  const authHeaders = userToken
    ? ({ Authorization: `Bearer ${userToken}` } as object)
    : {};

  const serviceUrl = `${getServiceBaseUrl(serviceUrlKeys.materialList)}${url}`;

  try {
    const response = await fetch(serviceUrl, {
      ...init,
      headers: {
        ...init.headers,
        ...authHeaders,
        "Accept-Version": "2"
      }
    });

    if (!response.ok) {
      throw new MaterialListServiceHttpError(
        response.status,
        response.statusText,
        serviceUrl
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      // Some responses are intentionally empty and thus cannot be
      // converted to JSON.
      return undefined as T;
    }
  } catch (error) {
    if (error instanceof MaterialListServiceHttpError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new FetchFailedError(message, serviceUrl);
  }
};

export default fetcher;

export type ErrorType<ErrorData> = ErrorData & { status: number };

export type BodyType<BodyData> = BodyData & { headers?: unknown };
