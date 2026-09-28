import React from "react"

import {
  getEbookPreviewUrl,
  getManifestationLabel,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { useDigitalEditionAvailability } from "@/hooks/useDigitalEditionAvailability"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"
import { TModalType } from "@/lib/helpers/modal-url"
import { openModal } from "@/store/modal.store"

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
  const identifier = getPublizonIdentifierFromManifestation(selectedManifestation)
  const label = getManifestationLabel(selectedManifestation)
  const category = getMaterialCategory(
    selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  )
  const isDisabled = !identifier

  const open = (modal: TModalType) =>
    openModal(modal, { wid: workId, pid: selectedManifestation.pid })

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
        <DigitalLoanButton
          workId={workId}
          selectedManifestation={selectedManifestation}
          label={label}
          isDisabled={isDisabled}
          onLoan={() => open("LoanLoginModal")}
        />
        <WorkPageButton ariaLabel={`Prøv ${label}`} asChild disabled={isDisabled}>
          <SmartLink href={getEbookPreviewUrl(workId, identifier || "")} reload>
            Prøv {label}
          </SmartLink>
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (category === "audio") {
    return (
      <WorkPageButtons>
        <DigitalLoanButton
          workId={workId}
          selectedManifestation={selectedManifestation}
          label={label}
          isDisabled={isDisabled}
          onLoan={() => open("LoanLoginModal")}
        />
        <WorkPageButton
          ariaLabel={`Prøv ${label}`}
          disabled={isDisabled}
          onClick={() => openModal("PlayerPreviewModal", { manifestation: selectedManifestation })}>
          Prøv {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  return null
}

// The loan button for a digital edition. A material in a Publizon reservation
// queue cannot be borrowed, so the button says so rather than sending the
// reader through a login to find out.
const DigitalLoanButton = ({
  workId,
  selectedManifestation,
  label,
  isDisabled,
  onLoan,
}: {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
  label: string
  isDisabled: boolean
  onLoan: () => void
}) => {
  const { isDigitalEditionOnLoan } = useDigitalEditionAvailability(workId)

  if (isDigitalEditionOnLoan(selectedManifestation)) {
    return (
      <WorkPageButton ariaLabel={`${label} er udlånt lige nu`} theme="primary" disabled>
        Udlånt lige nu
      </WorkPageButton>
    )
  }

  return (
    <WorkPageButton
      ariaLabel={`Lån ${label}`}
      theme="primary"
      disabled={isDisabled}
      onClick={onLoan}>
      Lån {label}
    </WorkPageButton>
  )
}

export default WorkPageButtonsLoggedOut
