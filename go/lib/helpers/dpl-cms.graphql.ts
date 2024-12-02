import { getLagoonUrl } from "./lagoon"

export const getDplCmsGraphqlEndpoint = () => {
  if (process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS) {
    return process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS
  }

  const lagoonUrl = getLagoonUrl("varnish")
  if (lagoonUrl) {
    return `${lagoonUrl}/graphql`
  }
}
