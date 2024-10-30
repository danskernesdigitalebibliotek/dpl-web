const serviceFbi = {
  "service.fbi.graphql.endpoint": () => {
    if (process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_FBI) {
      return process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_FBI
    }
  },
  // TODO: This is a temporary solution. We need to fetch the token via a graphql request.
  "token.adgangsplatformen.library": () => {
    return process.env.NEXT_PUBLIC_LIBRARY_TOKEN
  },
}

export default serviceFbi
