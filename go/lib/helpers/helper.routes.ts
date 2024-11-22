type RouteParams = { [key: string]: string | number }
type QueryParams = { [key: string]: string | number }

export function buildRoute({
  params,
  query,
}: {
  params?: RouteParams
  query?: QueryParams
}): string {
  let route = ""
  if (params) {
    route = Object.keys(params).reduce((acc, key) => {
      const value = encodeURIComponent(params[key])
      return `${acc}/${value}`
    }, route)
  }

  const queryParams = new URLSearchParams()
  if (query) {
    Object.keys(query).forEach(key => {
      queryParams.append(key, query[key].toString())
    })
  }

  if (queryParams.toString()) {
    return `${route}?${queryParams}`
  }

  return route
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
