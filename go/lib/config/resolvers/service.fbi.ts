import { getEnv } from "../env"

const serviceFbi = {
  "service.fbi.graphql.endpoint": () => {
    if (getEnv("GRAPHQL_SCHEMA_ENDPOINT_FBI")) {
      return getEnv("GRAPHQL_SCHEMA_ENDPOINT_FBI")
    }
  },
}

export default serviceFbi
