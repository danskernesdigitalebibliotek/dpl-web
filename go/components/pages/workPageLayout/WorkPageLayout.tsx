"use client"

import { useQuery } from "@tanstack/react-query"
import React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog"
import { Button } from "@/components/shared/button/Button"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

function WorkPageLayout({ wid }: { wid: string }) {
  const { data } = useQuery({
    queryKey: useGetMaterialQuery.getKey({ wid }),
    queryFn: useGetMaterialQuery.fetcher({ wid }),
  })

  const manifestations = data?.work?.manifestations.all

  console.log(manifestations)

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

      <Dialog>
        <DialogTrigger asChild>
          <Button ariaLabel="Prøv lydbog">Prøv lydbog</Button>
        </DialogTrigger>
        <DialogContent className="m-auto rounded-md">
          <DialogHeader>
            <DialogTitle>Prøv lydbog</DialogTitle>
            <DialogDescription>
              For at låne lydbogen skal du være oprettet som bruger på GO.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            {identifier && <Player type="demo" identifier={identifier} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WorkPageLayout
