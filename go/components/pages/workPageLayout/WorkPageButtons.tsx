import React, { useState } from "react"

import {
  isManifestationAudioBook,
  isManifestationEbook,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

export type WorkPageButtonsProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtons = ({ workId, selectedManifestation }: WorkPageButtonsProps) => {
  const identifier = selectedManifestation?.identifiers[0].value
  const url = resolveUrl({
    routeParams: { work: "work", ":wid": workId, read: "read" },
    queryParams: { id: identifier || "" },
  })
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  return (
    <>
      {isManifestationEbook(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv e-bog"
            size={"default"}
            className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
            asChild
            disabled={!!identifier}>
            <SmartLink linkType="external" href={url}>
              Prøv e-bog
            </SmartLink>
          </Button>
          <Button ariaLabel="Lån/reserver/læse ebog" className="w-full lg:max-w-80 lg:min-w-72">
            Not done yet
          </Button>
        </>
      )}
      {isManifestationAudioBook(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv lydbog"
            disabled={!!!identifier}
            className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
            Prøv lydbog
          </Button>
          <Button ariaLabel="Lån/reserver/læse lydbog" className="w-full lg:max-w-80 lg:min-w-72">
            Not done yet
          </Button>
        </>
      )}
      {isManifestationPodcast(selectedManifestation) && (
        <>
          <Button
            ariaLabel="Prøv podcast"
            disabled={!!!identifier}
            className="mb-grid-gap-half w-full lg:max-w-80 lg:min-w-72"
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}>
            Prøv podcast
          </Button>
          <Button ariaLabel="Hør podcast" className="w-full lg:max-w-80 lg:min-w-72">
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
          title={`Prøv ${isManifestationPodcast(selectedManifestation) ? "Podcast" : "Lydbog"}`}
          description={`For at låne ${isManifestationPodcast(selectedManifestation) ? "podcast" : "lydbogen"} skal du være oprettet som bruger på GO.`}>
          <Player type="demo" identifier={selectedManifestation.identifiers[0].value} />
        </ResponsiveDialog>
      )}
    </>
  )
}

export default WorkPageButtons
