import React from "react"

import {
  isManifestationAudioBook,
  isManifestationBook,
  isManifestationEbook,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { modalStore } from "@/store/modal.store"
import { sheetStore } from "@/store/sheet.store"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtons from "./WorkPageButtons"
import WorkPageInfoBox from "./WorkPageInfoBox"

export type WorkPageButtonsLoggedOutProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtonsLoggedOut = ({
  workId,
  selectedManifestation,
}: WorkPageButtonsLoggedOutProps) => {
  const identifier = selectedManifestation?.identifiers[0].value

  const { openSheet } = sheetStore.trigger
  const { openModal } = modalStore.trigger

  if (isManifestationBook(selectedManifestation))
    return <WorkPageInfoBox text="Bogen kan lånes på dit bibliotek" />

  if (isManifestationEbook(selectedManifestation)) {
    const previewUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { id: identifier || "" },
    })

    return (
      <WorkPageButtons>
        <WorkPageButton ariaLabel="Prøv e-bog" asChild disabled={!identifier}>
          <SmartLink linkType="external" href={previewUrl}>
            Prøv e-bog
          </SmartLink>
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={"Lån e-bog"}
          theme={"primary"}
          disabled={!identifier}
          onClick={() => {
            openSheet({
              sheetType: "LoginSheet",
            })
          }}>
          Lån e-bog
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (isManifestationAudioBook(selectedManifestation)) {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel="Prøv lydbog"
          disabled={!identifier}
          onClick={() =>
            openModal({
              modalType: "PlayerPreviewModal",
              props: { manifestation: selectedManifestation },
            })
          }>
          Prøv lydbog
        </WorkPageButton>
        <WorkPageButton
          ariaLabel="Lån lydbog"
          theme={"primary"}
          disabled={!identifier}
          onClick={() => {
            openSheet({
              sheetType: "LoginSheet",
            })
          }}>
          Lån lydbog
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (isManifestationPodcast(selectedManifestation)) {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel="Prøv podcast"
          disabled={!identifier}
          onClick={() =>
            openModal({
              modalType: "PlayerPreviewModal",
              props: { manifestation: selectedManifestation },
            })
          }>
          Prøv podcast
        </WorkPageButton>
        <WorkPageButton
          ariaLabel="Lån podcast"
          theme={"primary"}
          disabled={!identifier}
          onClick={() => {
            openSheet({
              sheetType: "LoginSheet",
            })
          }}>
          Lån podcast
        </WorkPageButton>
      </WorkPageButtons>
    )
  }
}

export default WorkPageButtonsLoggedOut
