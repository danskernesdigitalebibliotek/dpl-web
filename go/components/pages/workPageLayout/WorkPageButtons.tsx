import React, { useState } from "react"

import { isAudioBook, isEbook, isPodcast } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

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
            ariaLabel="Prøv e-bog"
            size={"default"}
            className="mb-grid-gap-half w-full lg:min-w-72 lg:max-w-80"
            asChild
            disabled={!!identifier}>
            <SmartLink linkType="external" href={url}>
              Prøv e-bog
            </SmartLink>
          </Button>
          <Button ariaLabel="Lån/reserver/læse ebog" className="w-full lg:min-w-72 lg:max-w-80">
            Not done yet
          </Button>
        </>
      )}
      {isAudioBook(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv lydbog"
            disabled={!!!identifier}
            className="mb-grid-gap-half w-full lg:min-w-72 lg:max-w-80"
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
            Prøv lydbog
          </Button>
          <Button ariaLabel="Lån/reserver/læse lydbog" className="w-full lg:min-w-72 lg:max-w-80">
            Not done yet
          </Button>
        </>
      )}
      {isPodcast(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv podcast"
            disabled={!!!identifier}
            className="mb-grid-gap-half w-full lg:min-w-72 lg:max-w-80"
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
            Prøv podcast
          </Button>
          <Button ariaLabel="Hør podcast" className="w-full lg:min-w-72 lg:max-w-80">
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
          title={`Prøv ${isPodcast(selectedManifestation) ? "Podcast" : "Lydbog"}`}
          description={
            isPodcast(selectedManifestation)
              ? "For at høre podcast skal du være oprettet som bruger på GO."
              : "For at låne lydbogen skal du være oprettet som bruger på GO."
          }>
          <Player type="demo" identifier={selectedManifestation.identifiers[0].value} />
        </ResponsiveDialog>
      )}
    </>
  )
}

export default WorkPageButtons
