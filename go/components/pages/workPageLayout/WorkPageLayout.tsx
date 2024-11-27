"use client"

import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

function WorkPageLayout({ wid }: { wid: string }) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  const { data } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid }),
    queryFn: useGetMaterialQuery.fetcher({ wid }),
  })

  // TODO: Handle potential error states
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
            Prøv ebog
          </SmartLink>
        </Button>
      )}

      {identifier && (
        <Button ariaLabel="Prøv lydbog" onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
          Prøv lydbog
        </Button>
      )}

      <ResponsiveDialog
        open={isPlayerOpen}
        onOpenChange={() => {
          setIsPlayerOpen(!isPlayerOpen)
        }}
        title="Prøv lydbog"
        description="For at låne lydbogen skal du være oprettet som bruger på GO.">
        <Player type="demo" identifier={identifier} />
      </ResponsiveDialog>
    </div>
  )
}

export default WorkPageLayout
