import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

import { isAudioBook, isEbook } from "./helper"

export type WorkPageButtonsProps = {
  workId: string
}

const WorkPageButtons = ({ workId }: WorkPageButtonsProps) => {
  const { selectedManifestation } = useSelectedManifestationStore()
  const identifier = selectedManifestation?.identifiers[0].value
  const url = resolveUrl({
    routeParams: { work: "work", ":wid": workId, read: "read" },
    queryParams: { id: identifier || "" },
  })
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  return (
    <>
      {isEbook(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv ebog"
            size={"default"}
            className="mb-grid-gap-half min-w-full lg:min-w-80"
            asChild
            disabled={!!identifier}>
            <SmartLink linkType="external" href={url}>
              Prøv ebog
            </SmartLink>
          </Button>
          <Button ariaLabel="Lån/reserver/læse ebog" className="min-w-full lg:min-w-80">
            Not done yet
          </Button>
        </>
      )}

      {isAudioBook(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv lydbog"
            disabled={!!!identifier}
            className="mb-grid-gap-half min-w-full lg:min-w-80"
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
            Prøv lydbog
          </Button>
          <Button ariaLabel="Lån/reserver/læse lydbog" className="min-w-full lg:min-w-80">
            Not done yet
          </Button>
        </>
      )}

      {/* Reader / Player dialog */}
      {!!selectedManifestation?.identifiers[0].value && (
        <ResponsiveDialog
          open={isPlayerOpen}
          onOpenChange={() => {
            setIsPlayerOpen(!isPlayerOpen)
          }}
          title="Prøv lydbog"
          description="For at låne lydbogen skal du være oprettet som bruger på GO.">
          <Player type="demo" identifier={selectedManifestation.identifiers[0].value} />
        </ResponsiveDialog>
      )}
    </>
  )
}

export default WorkPageButtons
