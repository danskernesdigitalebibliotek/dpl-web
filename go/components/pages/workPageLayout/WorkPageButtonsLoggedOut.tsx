import { first } from "lodash"
import { useQueryStates } from "nuqs"
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
import { modalParsers } from "@/lib/helpers/modal-url"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtons from "./WorkPageButtons"

export type WorkPageButtonsLoggedOutProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtonsLoggedOut = ({
  workId,
  selectedManifestation,
}: WorkPageButtonsLoggedOutProps) => {
  const identifier = first(selectedManifestation?.identifiers)?.value
  const [, setModal] = useQueryStates(modalParsers, { scroll: false })

  const materialTypeCode = selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  const label = getManifestationLabel(selectedManifestation)

  const openLoanLoginModal = () =>
    setModal({
      modal: "LoanLoginModal",
      modalProps: { wid: workId, pid: selectedManifestation.pid },
    })

  if (isPhysicalMaterialType(materialTypeCode)) {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Reservér ${label}`}
          theme={"primary"}
          onClick={() =>
            setModal({
              modal: "ReservationLoginModal",
              modalProps: { wid: workId, pid: selectedManifestation.pid },
            })
          }>
          Reservér {label}
        </WorkPageButton>
      </WorkPageButtons>
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
          <SmartLink href={previewUrl}>Prøv {label}</SmartLink>
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme={"primary"}
          disabled={!identifier}
          onClick={openLoanLoginModal}>
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
            setModal({
              modal: "PlayerPreviewModal",
              modalProps: { wid: workId, pid: selectedManifestation.pid },
            })
          }>
          Prøv {label}
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme={"primary"}
          disabled={!identifier}
          onClick={openLoanLoginModal}>
          Lån {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }
}

export default WorkPageButtonsLoggedOut
