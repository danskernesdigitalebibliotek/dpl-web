import { getEnv } from "../config/env"

// If production set stale time to 1 minute, otherwise set to 0.
// Which means no caching in development.
export const getQueryClientStaleTime = () =>
  getEnv("NODE_ENV") === "production" ? 1 * 60 * 1000 : 0

// Every operation is posted to the same /graphql endpoint, which makes the
// requests impossible to tell apart in the browser's network log. Appending the
// operation name as a valueless query parameter (eg. /graphql?getMaterial)
// labels the request without changing it - the endpoint ignores the parameter.
const operationNamePattern = /\b(?:query|mutation|subscription)\s+(\w+)/

export const getOperationName = (query: string) => query.match(operationNamePattern)?.[1]

export const addOperationNameToUrl = (url: string, query: string) => {
  const operationName = getOperationName(query)

  if (!operationName) {
    return url
  }

  return `${url}${url.includes("?") ? "&" : "?"}${operationName}`
}
