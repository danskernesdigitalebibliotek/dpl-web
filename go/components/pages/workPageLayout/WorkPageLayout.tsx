"use client"

import { useQuery } from "@tanstack/react-query"
import React from "react"

import { Button } from "@/components/shared/button/Button"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

function WorkPageLayout({ wid }: { wid: string }) {
  const { data } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid }),
    queryFn: useGetMaterialQuery.fetcher({ wid }),
  })

  const manifestations = data?.work?.manifestations.all
  const identifier = manifestations?.[0].identifiers?.[0].value || ""

  const url = resolveUrl({
    routeParams: { work: "work", ":wid": wid, read: "read" },
    queryParams: { id: identifier },
  })

  return (
    <div>
      {identifier && (
        <Button ariaLabel="Prøv ebog" asChild>
          <SmartLink linkType="external" href={url}>
            Read
          </SmartLink>
        </Button>
      )}
    </div>
  )
}

export default WorkPageLayout
