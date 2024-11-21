"use client"

import { useQuery } from "@tanstack/react-query"
import React from "react"

import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type WorkPageLayoutProps = {
  workId: string
}

function WorkPageLayout({ workId }: WorkPageLayoutProps) {
  const { data, isLoading } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid: workId }),
    queryFn: useGetMaterialQuery.fetcher({ wid: workId }),
  })

  return (
    <div>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  )
}

export default WorkPageLayout
