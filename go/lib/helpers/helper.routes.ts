type RouteParams = { [key: string]: string | number }
type QueryParams = { [key: string]: string | number }

export function buildRoute({
  params,
  query,
}: {
  params?: RouteParams
  query?: QueryParams
}): string {
  const pathComponents: string[] = []

  if (params) {
    for (const value of Object.values(params)) {
      pathComponents.push(encodeURIComponent(value))
    }
  }

  let path = `/${pathComponents.join("/")}`

  if (query) {
    const searchParams = new URLSearchParams()

    Object.keys(query).forEach(key => {
      searchParams.append(key, query[key].toString())
    })

    path += "?" + searchParams.toString()
  }

  return path
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
      routeParams?: { work: "work"; ":wid": number | string; preview: "preview" }
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
