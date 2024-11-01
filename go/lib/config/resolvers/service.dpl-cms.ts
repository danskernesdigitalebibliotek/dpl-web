const serviceDplCms = {
  "service.dpl-cms.graphql.endpoint": () => {
    if (process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS) {
      return process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS
    }
  },
}

export default serviceDplCms
