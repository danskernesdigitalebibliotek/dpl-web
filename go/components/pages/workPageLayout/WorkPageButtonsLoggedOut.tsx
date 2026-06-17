import { first } from "lodash"
import { useQueryStates } from "nuqs"
import React from "react"

import {
  getEbookPreviewUrl,
  getManifestationLabel,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { TModalType, modalParsers } from "@/lib/helpers/modal-url"

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
  const [, setModal] = useQueryStates(modalParsers, { scroll: false })

  const identifier = first(selectedManifestation?.identifiers)?.value
  const label = getManifestationLabel(selectedManifestation)
  const category = getMaterialCategory(
    selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  )
  const isDisabled = !identifier

  const open = (modal: TModalType) =>
    setModal({ modal, modalProps: { wid: workId, pid: selectedManifestation.pid } })

  if (category === "physical") {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Reserver ${label}`}
          theme="primary"
          onClick={() => open("ReservationLoginModal")}>
          Reserver {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (category === "ebook") {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme="primary"
          disabled={isDisabled}
          onClick={() => open("LoanLoginModal")}>
          Lån {label}
        </WorkPageButton>
        <WorkPageButton ariaLabel={`Prøv ${label}`} asChild disabled={isDisabled}>
          <SmartLink href={getEbookPreviewUrl(workId, identifier || "")}>Prøv {label}</SmartLink>
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (category === "audio") {
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme="primary"
          disabled={isDisabled}
          onClick={() => open("LoanLoginModal")}>
          Lån {label}
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Prøv ${label}`}
          disabled={isDisabled}
          onClick={() => open("PlayerPreviewModal")}>
          Prøv {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  return null
}

export default WorkPageButtonsLoggedOut
