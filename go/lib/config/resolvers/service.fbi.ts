const serviceFbi = {
  "service.fbi.graphql.endpoint": () => {
    if (process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_FBI) {
      return process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_FBI
    }
  },
}

export default serviceFbi
