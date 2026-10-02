"use client"

import {
  type CreateReservationResult,
  type CreateReservationSuccess,
  type RecordAvailability,
  useCreateReservation,
  useMaterialAvailability,
  usePatron,
  useReservations,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useEffect, useState } from "react"

import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { ModalFlowBody } from "@/components/shared/modalFlow/ModalFlowBody"
import ReservationFormContent from "@/components/shared/reservationModal/ReservationFormContent"
import ReservationReceiptContent from "@/components/shared/reservationModal/ReservationReceiptContent"
import { getReservationFailureMessage } from "@/components/shared/reservationModal/helper"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { useBlacklistedAvailabilityBranches } from "@/hooks/useBlacklistedAvailabilityBranches"
import { useWorkRecordIds } from "@/hooks/useEditionAvailability"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { findReservationByRecordId } from "@/lib/helpers/helper.reservation"
import { pidToFaust } from "@/lib/helpers/ids"

// Copies on the shelf and the queue are separate facts: an edition can be
// lent out with nobody waiting for it. Saying only the queue reads as
// "available today" for a book that is not there.
const getQueueText = (edition: RecordAvailability): string => {
  if (edition.availableCopies > 0) return "Du er ved at reservere den."
  if (edition.reservationCount === 0) return "Du er den næste i køen."

  const borrowers = edition.reservationCount === 1 ? "låner" : "lånere"
  return `Der er ${edition.reservationCount} ${borrowers} i kø foran dig.`
}

type ReservationModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const ReservationModal = ({ open, onClose, wid, pid }: ReservationModalProps) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const work = data?.work
  const manifestation = findManifestationByPid(work, pid)
  const recordId = manifestation ? pidToFaust(manifestation.pid) : null

  // Shared with the edition picker so both land on the same query key.
  const { recordIds } = useWorkRecordIds(wid)

  const { data: patron } = usePatron()
  const blacklistedBranches = useBlacklistedAvailabilityBranches()
  const { data: availability } = useMaterialAvailability(wid, recordIds, blacklistedBranches, {
    enabled: recordIds.length > 0,
  })
  // The copy below speaks about the edition being reserved, so it reads that
  // record rather than the work-wide totals the query also carries.
  const editionAvailability = recordId ? availability?.records[recordId] : undefined

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

  // The dialog must have a name from the start — while the material query
  // loads and the visible title is empty, aria-label carries the bare action.
  const title = manifestation ? `Reserver ${getManifestationLabel(manifestation)}` : ""

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={title}
      ariaLabel={manifestation ? undefined : "Reserver"}>
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
            {/* Both numbers are for the chosen edition, not the whole work:
                the reader reserves one edition, so the queue they join is that
                edition's.*/}
            {editionAvailability && (
              <p className="text-typo-caption text-foreground-muted text-center">
                Biblioteket har {editionAvailability.totalCopies} stk. af denne bog.{" "}
                {getQueueText(editionAvailability)}
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
