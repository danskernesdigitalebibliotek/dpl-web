import React from "react"

import {
  getEbookPreviewUrl,
  getEbookReadUrl,
  getManifestationLabel,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import { cyKeys } from "@/cypress/support/constants"
import { useExistingLoan } from "@/hooks/useExistingLoan"
import { useExistingReservation } from "@/hooks/useExistingReservation"
import usePatronShelf from "@/hooks/usePatronShelf"
import useSession from "@/hooks/useSession"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"
import { TModalType } from "@/lib/helpers/modal-url"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"
import { openModal } from "@/store/modal.store"

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
  const { session } = useSession()
  const { data: dataLoans, isLoading: isLoadingLoans, isError: isErrorLoans } = useGetV1UserLoans()

  if (isLoadingLoans) {
    return <WorkPageButtons.Skeleton />
  }

  const identifier = getPublizonIdentifierFromManifestation(selectedManifestation)
  const label = getManifestationLabel(selectedManifestation)
  const category = getMaterialCategory(
    selectedManifestation?.materialTypes[0]?.materialTypeSpecific.code
  )
  const loan = dataLoans?.loans?.find(l => l.libraryBook?.identifier === identifier)
  const isLoaned = !!loan
  const isDisabled = isErrorLoans || !identifier

  const open = (modal: TModalType) =>
    openModal(modal, { wid: workId, pid: selectedManifestation.pid })

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
            onClick={() =>
              openModal("PlayerModal", {
                manifestation: selectedManifestation,
                orderId: loan?.orderId ?? undefined,
              })
            }>
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
          onClick={() => openModal("PlayerPreviewModal", { manifestation: selectedManifestation })}>
          Prøv {label}
        </WorkPageButton>
      </WorkPageButtons>
    )
  }

  return null
}

// Renders the patron's state for the material: already loaned → status row
// with a button opening the loan details; already reserved → status row with
// a button opening the reservation details (with deletion inside); otherwise
// the "Reserver" CTA.
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
  const existingLoan = useExistingLoan(selectedManifestation.pid)
  const existingReservation = useExistingReservation(selectedManifestation.pid)

  // A loan trumps a reservation for the same record.
  if (existingLoan) {
    return (
      <>
        <div className="w-full lg:max-w-80 lg:min-w-72">
          <div
            className="text-typo-caption text-foreground-muted flex w-full justify-center
              lg:ml-auto">
            Du har lånt denne bog
          </div>
        </div>
        <ViewLoanButton recordId={existingLoan.recordId} />
      </>
    )
  }

  if (existingReservation) {
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
          ariaLabel="Se reservering"
          theme="primary"
          dataCy={cyKeys["view-reservation-button"]}
          onClick={() =>
            openModal("ReservationDetailsModal", {
              recordId: existingReservation.recordId,
            })
          }>
          Se reservering
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

// Opens the existing loan in the loan details modal (with renewal inside).
// Only mounted when the patron has the material on loan, so the shelf lookup
// pairing the FBS record with its FBI work never runs for anyone else.
const ViewLoanButton = ({ recordId }: { recordId: string }) => {
  const { loanItems } = usePatronShelf()
  const item = loanItems.find(({ loan }) => loan.recordId === recordId)

  return (
    <WorkPageButton
      ariaLabel="Se lån"
      theme="primary"
      dataCy={cyKeys["view-loan-button"]}
      disabled={!item}
      onClick={() => {
        if (!item) return
        openModal("LoanDetailsModal", {
          loan: item.loan,
          manifestation: item.manifestation,
          title: item.work.titles.full[0],
          workId: item.work.workId,
          creators: displayCreators(item.work.creators, 1),
        })
      }}>
      Se lån
    </WorkPageButton>
  )
}

export default WorkPageButtonsLoggedIn
