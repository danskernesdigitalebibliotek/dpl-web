import React from "react"

import { fetcher } from "@/lib/graphql/fetchers/dpl-cms.fetcher"
import { GetPageByPathDocument, GetPageByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

async function page(props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params

  const { path } = params

  const data = await fetcher<GetPageByPathQuery, { path: string }>(GetPageByPathDocument, {
    path: path.join("/"),
  })()

  return (
    <div>
      page
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default page
