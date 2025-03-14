import { getEnv } from "../config/env"

type RouteParams = { [key: string]: string | number }
type QueryParams = { [key: string]: string | number }

export function buildRoute({
  params,
  query,
}: {
  params?: RouteParams
  query?: QueryParams
}): string {
  let routeParams = ""
  if (params) {
    routeParams = Object.keys(params).reduce((acc, key) => {
      const value = encodeURIComponent(params[key])
      return `${acc}/${value}`
    }, routeParams)
  }

  const url = new URL(routeParams, getEnv("APP_URL"))
  if (query) {
    Object.keys(query).forEach(key => {
      url.searchParams.append(key, query[key].toString())
    })
  }

  return url.toString()
}

type ResolveUrlOptions =
  | {
      routeParams?: { work: "work"; wid: number | string }
      queryParams?: QueryParams
    }
  | {
      routeParams?: { work: "work"; ":wid": number | string; read: "read" }
      queryParams?: QueryParams
    }
  | {
      routeParams?: { search: "search" }
      queryParams?: QueryParams
    }

export const resolveUrl = ({ routeParams, queryParams }: ResolveUrlOptions) => {
  if (!routeParams) {
    throw new Error("routeParams is required")
  }

  return buildRoute({
    params: routeParams,
    query: queryParams,
  })
}
