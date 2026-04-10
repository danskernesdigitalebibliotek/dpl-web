import { first } from "lodash"
import React from "react"

import {
  getManifestationLabel,
  isAudioMaterialType,
  isEbookMaterialType,
  isPhysicalMaterialType,
  isPodcastMaterialType,
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
  const identifier = first(selectedManifestation?.identifiers)?.value

  const { openSheet } = sheetStore.trigger
  const { openModal } = modalStore.trigger

  const materialTypeCode = selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  const label = getManifestationLabel(selectedManifestation)

  if (isPhysicalMaterialType(materialTypeCode)) {
    return (
      <WorkPageInfoBox
        text={`Dette er en fysisk ${label}. Den kan lånes på dit lokale bibliotek`}
      />
    )
  }

  if (isEbookMaterialType(materialTypeCode)) {
    const previewUrl = resolveUrl({
      routeParams: { work: "work", ":wid": workId, read: "read" },
      queryParams: { id: identifier || "" },
    })

    return (
      <WorkPageButtons>
        <WorkPageButton ariaLabel={`Prøv ${label}`} asChild disabled={!identifier}>
          <SmartLink linkType="external" href={previewUrl}>
            Prøv {label}
          </SmartLink>
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme={"primary"}
          disabled={!identifier}
          onClick={() => {
            openSheet({
              sheetType: "LoginSheet",
            })
          }}>
          Lån {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (isAudioMaterialType(materialTypeCode) || isPodcastMaterialType(materialTypeCode)) {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Prøv ${label}`}
          disabled={!identifier}
          onClick={() =>
            openModal({
              modalType: "PlayerPreviewModal",
              props: { manifestation: selectedManifestation },
            })
          }>
          Prøv {label}
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme={"primary"}
          disabled={!identifier}
          onClick={() => {
            openSheet({
              sheetType: "LoginSheet",
            })
          }}>
          Lån {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }
}

export default WorkPageButtonsLoggedOut
