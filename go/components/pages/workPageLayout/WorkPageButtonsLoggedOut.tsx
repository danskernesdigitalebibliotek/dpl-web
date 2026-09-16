import React from "react"

import {
  getEbookPreviewUrl,
  getManifestationLabel,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { useBiblioAdapter } from "@/hooks/useBiblioAdapter"
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
  // WeDoBooks answers samples for signed-in patrons only, and with the
  // adapter on there is no Publizon fallback - anonymous users get no
  // preview at all.
  // TODO(publizon-sunset): remove when the Publizon API is phased out — the
  // preview buttons below disappear for anonymous users unconditionally.
  const hidePreview = useBiblioAdapter()

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
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme="primary"
          disabled={isDisabled}
          onClick={() => open("LoanLoginModal")}>
          Lån {label}
        </WorkPageButton>
        {!hidePreview && (
          <WorkPageButton ariaLabel={`Prøv ${label}`} asChild disabled={isDisabled}>
            <SmartLink href={getEbookPreviewUrl(workId, identifier || "")} reload>
              Prøv {label}
            </SmartLink>
          </WorkPageButton>
        )}
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
        {!hidePreview && (
          <WorkPageButton
            ariaLabel={`Prøv ${label}`}
            disabled={isDisabled}
            onClick={() =>
              openModal("PlayerPreviewModal", { manifestation: selectedManifestation })
            }>
            Prøv {label}
          </WorkPageButton>
        )}
      </WorkPageButtons>
    )
  }

  return null
}

export default WorkPageButtonsLoggedOut
