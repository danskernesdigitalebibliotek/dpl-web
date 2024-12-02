import { getLagoonUrl } from "./lagoon"

export const getDplCmsGraphqlEndpoint = () => {
  if (process.env.NEXT_PUBLIC_DPL_CMS_GRAPHQL_ENDPOINT) {
    return process.env.NEXT_PUBLIC_DPL_CMS_GRAPHQL_ENDPOINT
  }

  const lagoonUrl = getLagoonUrl("varnish")
  if (lagoonUrl) {
    return `${lagoonUrl}/graphql`
  }
}
