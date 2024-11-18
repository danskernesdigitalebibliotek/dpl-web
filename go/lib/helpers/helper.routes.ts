type RouteParams = { [key: string]: string | number }
type QueryParams = { [key: string]: string | number }

export function buildRoute({
  route,
  params,
  query,
}: {
  route: string
  params?: RouteParams
  query?: QueryParams
}): string {
  if (params) {
    route = Object.keys(params).reduce((acc, key) => {
      const value = encodeURIComponent(params[key])
      return acc.replace(`:${key}`, value)
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
      type: "work"
      routeParams?: { id: number | string }
      queryParams?: QueryParams
    }
  | {
      type: "search"
      routeParams?: undefined
      queryParams?: QueryParams
    }

export const resolveUrl = ({ type, routeParams, queryParams }: ResolveUrlOptions) => {
  switch (type as ResolveUrlOptions["type"]) {
    case "work":
      if (!routeParams?.id) return ""
      return buildRoute({ route: "/work/:id", params: { id: routeParams.id }, query: queryParams })
    case "search":
      return buildRoute({ route: "/search", query: queryParams })
    default:
      return ""
  }
}
