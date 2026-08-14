"use client"

import {
  type CreateReservationResult,
  type CreateReservationSuccess,
  useCreateReservation,
  useLoans,
  useMaterialAvailability,
  usePatron,
  useReservations,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useEffect, useState } from "react"

import {
  getManifestationLabel,
  isPhysicalMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { ModalFlowBody } from "@/components/shared/modalFlow/ModalFlowBody"
import ReservationFormContent from "@/components/shared/reservationModal/ReservationFormContent"
import ReservationReceiptContent from "@/components/shared/reservationModal/ReservationReceiptContent"
import { getReservationFailureMessage } from "@/components/shared/reservationModal/helper"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { useBlacklistedAvailabilityBranches } from "@/hooks/useBlacklistedAvailabilityBranches"
import usePatronShelf from "@/hooks/usePatronShelf"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { findReservationByRecordId } from "@/lib/helpers/helper.reservation"
import { getFaustIdsFromManifestations, pidToFaust } from "@/lib/helpers/ids"
import { openModal } from "@/store/modal.store"

type ReservationModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

// Hands the modal over to the loan details once the shelf has paired the
// loan with its FBI work. Only mounted when the patron already has the
// material on loan.
const RedirectToLoanDetails = ({ recordId }: { recordId: string }) => {
  const { loanItems } = usePatronShelf()
  const item = loanItems.find(({ loan }) => loan.recordId === recordId)

  useEffect(() => {
    if (!item) return
    openModal("LoanDetailsModal", {
      loan: item.loan,
      manifestation: item.manifestation,
      title: item.work.titles.full[0],
      workId: item.work.workId,
      creators: displayCreators(item.work.creators, 1),
    })
  }, [item])

  return null
}

const ReservationModal = ({ open, onClose, wid, pid }: ReservationModalProps) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const work = data?.work
  const manifestation = findManifestationByPid(work, pid)
  const recordId = manifestation ? pidToFaust(manifestation.pid) : null

  // The modal can open via the one-shot URL handover after login, where the
  // patron may turn out to already have the material on loan. Reserving is
  // off the table then, so the loan details take over instead.
  const { data: loans } = useLoans()
  const existingLoan = loans?.find(loan => loan.recordId === pidToFaust(pid))

  const physicalManifestations =
    work?.manifestations?.all.filter(m =>
      isPhysicalMaterialType(m.materialTypes[0]?.materialTypeSpecific.code)
    ) ?? []
  const recordIds = getFaustIdsFromManifestations(physicalManifestations)

  const { data: patron } = usePatron()
  const blacklistedBranches = useBlacklistedAvailabilityBranches()
  const { data: availability } = useMaterialAvailability(wid, recordIds, blacklistedBranches, {
    enabled: recordIds.length > 0,
  })
  const { data: reservations } = useReservations()

  const { mutate: createReservation, isPending: isSubmitting } = useCreateReservation()
  const [successResult, setSuccessResult] = useState<CreateReservationSuccess | null>(null)

  // Local results are pinned to the current recordId. Reset when the user
  // navigates the modal to a different manifestation so a previous book's
  // receipt doesn't bleed into the new one.
  useEffect(() => {
    setSuccessResult(null)
  }, [recordId])

  // The receipt step is derivable: either we just succeeded (local state)
  // or the patron already has a reservation for this manifestation
  // (server state).
  const existingReservation = findReservationByRecordId(reservations, recordId)
  const derivedResult: CreateReservationSuccess | null =
    successResult ??
    (existingReservation
      ? {
          status: "success",
          recordId: existingReservation.recordId,
          reservationId: existingReservation.reservationId,
          pickupBranchId: existingReservation.pickupBranchId,
          numberInQueue: existingReservation.numberInQueue,
        }
      : null)
  const isReceiptStep = derivedResult !== null

  const handleApprove = () => {
    if (!recordId || isSubmitting) return
    createReservation(
      {
        workId: wid,
        recordId,
        ...(patron?.pickupBranchId ? { pickupBranchId: patron.pickupBranchId } : {}),
      },
      {
        onSuccess: (result: CreateReservationResult) => {
          if (result.status === "success") {
            setSuccessResult(result)
          } else {
            toast.error(getReservationFailureMessage(result.reason))
          }
        },
        onError: () => {
          // Network / non-JSON — surface via the "unknown" copy bucket.
          toast.error(getReservationFailureMessage("unknown"))
        },
      }
    )
  }

  const submitDisabled = isSubmitting || !recordId

  if (existingLoan) {
    return (
      <>
        <RedirectToLoanDetails recordId={existingLoan.recordId} />
        {/* Placeholder shell under the loan details' title while the shelf
            pairs the loan — avoids flashing the reservation form. */}
        <ResponsiveDialog open={open} onClose={onClose} title="Dit lån">
          <ModalFlowBody viewKey="loan-redirect">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-background-skeleton rounded-base h-[76px] animate-pulse"
                />
              ))}
            </div>
          </ModalFlowBody>
        </ResponsiveDialog>
      </>
    )
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={(manifestation && `Reserver ${getManifestationLabel(manifestation)}`) || ""}>
      <ModalFlowBody viewKey={isReceiptStep ? "receipt" : "form"}>
        {manifestation && work && (
          <div data-cy={cyKeys["reservation-modal"]}>
            {isReceiptStep && derivedResult ? (
              <ReservationReceiptContent
                manifestation={manifestation}
                result={derivedResult}
                patron={patron}
              />
            ) : (
              <ReservationFormContent work={work} manifestation={manifestation} patron={patron} />
            )}
          </div>
        )}
      </ModalFlowBody>

      <ResponsiveDialog.Actions>
        {isReceiptStep ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            OK
          </Button>
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
            {availability && (
              <p className="text-typo-caption text-foreground-muted text-center">
                Biblioteket har {availability.totalCopies}{" "}
                {availability.totalCopies === 1 ? "eksemplar" : "eksemplarer"}. Der er{" "}
                {availability.reservationCount}{" "}
                {availability.reservationCount === 1 ? "reservering" : "reserveringer"} til dette
                materiale.
              </p>
            )}
            <Button
              theme="primary"
              size="lg"
              data-cy={cyKeys["approve-reservation-button"]}
              onClick={handleApprove}
              disabled={submitDisabled}
              isLoading={isSubmitting}>
              Godkend reservering
            </Button>
          </div>
        )}
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default ReservationModal
