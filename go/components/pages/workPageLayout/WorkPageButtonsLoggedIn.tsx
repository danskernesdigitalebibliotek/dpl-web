import { useReservations } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { first } from "lodash"
import { useQueryStates } from "nuqs"
import React from "react"

import {
  getEbookPreviewUrl,
  getEbookReadUrl,
  getManifestationLabel,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { cyKeys } from "@/cypress/support/constants"
import useSession from "@/hooks/useSession"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { findReservationByRecordId } from "@/lib/helpers/helper.reservation"
import { pidToFaust } from "@/lib/helpers/ids"
import { TModalType, modalParsers } from "@/lib/helpers/modal-url"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtons from "./WorkPageButtons"

export type WorkPageButtonsLoggedInProps = {
  workId: string
  selectedManifestation: ManifestationWorkPageFragment
}

const WorkPageButtonsLoggedIn = ({
  workId,
  selectedManifestation,
}: WorkPageButtonsLoggedInProps) => {
  const [, setModal] = useQueryStates(modalParsers, { scroll: false })
  const { session } = useSession()
  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = useGetV1UserLoans()

  if (isLoadingLoans) {
    return <WorkPageButtons.Skeleton />
  }

  const identifier = first(selectedManifestation?.identifiers)?.value
  const label = getManifestationLabel(selectedManifestation)
  const category = getMaterialCategory(
    selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  )
  const loan = dataLoans?.loans?.find(l => l.libraryBook?.identifier === identifier)
  const isLoaned = !!loan
  const isDisabled = isErrorLoans || !identifier

  const open = (modal: TModalType) =>
    setModal({ modal, modalProps: { wid: workId, pid: selectedManifestation.pid } })

  // data-cy on each rendered WorkPageButton lets cypress wait for the logged-in
  // branch to mount before clicking — the LoggedOut buttons (same label text)
  // don't carry it, so the selector reliably picks the right one.
  const dataCy = cyKeys["work-page-button-logged-in"]

  if (category === "physical") {
    const reservationModal: TModalType =
      session?.type === "unilogin" ? "ReservationUniloginModal" : "ReservationModal"
    return (
      <WorkPageButtons>
        <PhysicalReservationButton
          dataCy={dataCy}
          label={label}
          selectedManifestation={selectedManifestation}
          reservationModal={reservationModal}
          onOpen={open}
        />
      </WorkPageButtons>
    )
  }

  if (category === "ebook") {
    if (isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton ariaLabel={`Læs ${label}`} theme="primary" dataCy={dataCy} asChild>
            <SmartLink href={getEbookReadUrl(workId, loan.orderId || "")} reload>
              Læs {label}
            </SmartLink>
          </WorkPageButton>
        </WorkPageButtons>
      )
    }
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme="primary"
          dataCy={dataCy}
          disabled={isDisabled}
          onClick={() => open("LoanMaterialModal")}>
          Lån {label}
        </WorkPageButton>
        <WorkPageButton ariaLabel={`Prøv ${label}`} dataCy={dataCy} asChild disabled={isDisabled}>
          <SmartLink href={getEbookPreviewUrl(workId, identifier || "")} reload>
            Prøv {label}
          </SmartLink>
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  if (category === "audio") {
    if (isLoaned) {
      return (
        <WorkPageButtons>
          <WorkPageButton
            ariaLabel={`Lyt til ${label}`}
            theme="primary"
            dataCy={dataCy}
            disabled={isDisabled}
            onClick={() => open("PlayerModal")}>
            Lyt til {label}
          </WorkPageButton>
        </WorkPageButtons>
      )
    }
    return (
      <WorkPageButtons>
        <WorkPageButton
          ariaLabel={`Lån ${label}`}
          theme="primary"
          dataCy={dataCy}
          disabled={isDisabled}
          onClick={() => open("LoanMaterialModal")}>
          Lån {label}
        </WorkPageButton>
        <WorkPageButton
          ariaLabel={`Prøv ${label}`}
          dataCy={dataCy}
          disabled={isDisabled}
          onClick={() => open("PlayerPreviewModal")}>
          Prøv {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  return null
}

// Reads the patron's reservations and renders either the "Reserver" CTA or,
// when the manifestation is already reserved, the "Slet reservering"
// branch together with a small status row.
const PhysicalReservationButton = ({
  dataCy,
  label,
  selectedManifestation,
  reservationModal,
  onOpen,
}: {
  dataCy: string
  label: string
  selectedManifestation: ManifestationWorkPageFragment
  reservationModal: TModalType
  onOpen: (modal: TModalType) => void
}) => {
  const { data: reservations } = useReservations()
  const recordId = pidToFaust(selectedManifestation.pid)
  const existing = findReservationByRecordId(reservations, recordId)

  if (existing) {
    return (
      <>
        <div className="w-full lg:max-w-80 lg:min-w-72">
          <div
            className="text-typo-caption text-foreground-muted flex w-full justify-center
              lg:ml-auto">
            Bogen er reserveret til dig
          </div>
        </div>
        <WorkPageButton
          ariaLabel="Slet reservering"
          theme="primary"
          dataCy={cyKeys["delete-reservation-button"]}
          onClick={() => onOpen("DeleteReservationModal")}>
          Slet reservering
        </WorkPageButton>
      </>
    )
  }

  return (
    <WorkPageButton
      ariaLabel={`Reserver ${label}`}
      theme="primary"
      dataCy={dataCy}
      onClick={() => onOpen(reservationModal)}>
      Reserver {label}
    </WorkPageButton>
  )
}

export default WorkPageButtonsLoggedIn
