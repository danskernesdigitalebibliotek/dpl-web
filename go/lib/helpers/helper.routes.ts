type RouteParams = { [key: string]: string | number }
type QueryParams = { [key: string]: string | number }

// Example usage:
// const userRoute = buildRoute("/users/:id", { id: 123 })
// console.log(userRoute) // Output: /users/123

// const searchRoute = buildRoute("/search", undefined, { query: "test" })
// console.log(searchRoute) // Output: /search?query=test

function buildRoute(route: string, params?: RouteParams, query?: QueryParams): string {
  if (params) {
    route = Object.keys(params).reduce((acc, key) => {
      const value = encodeURIComponent(params[key])
      return acc.replace(`:${key}`, value)
    }, route)
  }

  if (query) {
    const queryString = Object.keys(query)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
      .join("&")
    route += `?${queryString}`
  }

  return route
}

// Add url resolvers for each route below
const resolveWorkUrl = (id: string) => {
  return buildRoute("/work/:id", { id: id })
}

export { resolveWorkUrl, buildRoute }
