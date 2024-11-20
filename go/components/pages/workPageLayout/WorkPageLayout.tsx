"use client"

import { useQuery } from "@tanstack/react-query"
import React from "react"

import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

function WorkPageLayout({ wid }: { wid: string }) {
  const data = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid }),
    queryFn: useGetMaterialQuery.fetcher({ wid }),
  })

  return (
    <div>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  )
}

export default WorkPageLayout
