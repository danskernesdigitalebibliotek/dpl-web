const serviceDplCms = {
  "service.dpl-cms.graphql.endpoint": () => {
    if (process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS) {
      return process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS
    }
  },
  "service.dpl-cms.basic-auth.header": () => {
    if (process.env.GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS_AUTH_HEADER) {
      return process.env.GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS_AUTH_HEADER
    }
  },
}

export default serviceDplCms
