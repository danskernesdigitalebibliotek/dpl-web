"use client"

import {
  type CreateReservationFailed,
  type CreateReservationResult,
  type CreateReservationSuccess,
  useCreateReservation,
  useMaterialAvailability,
  usePatron,
  useReservations,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useCallback, useState } from "react"

import {
  getManifestationLabel,
  isPhysicalMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import ReservationErrorContent from "@/components/shared/reservationModal/ReservationErrorContent"
import ReservationFormContent from "@/components/shared/reservationModal/ReservationFormContent"
import ReservationReceiptContent from "@/components/shared/reservationModal/ReservationReceiptContent"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { getManifestationByPid } from "@/lib/graphql/selectors/manifestation"
import { getReservationByRecordId } from "@/lib/graphql/selectors/reservation"
import { getFaustIdsFromManifestations, pidToFaust } from "@/lib/helpers/ids"

type ReservationModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const ReservationModal = ({ open, onClose, wid, pid }: ReservationModalProps) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const work = data?.work
  const manifestation = getManifestationByPid(work, pid)
  const recordId = manifestation ? pidToFaust(manifestation.pid) : null

  const physicalManifestations =
    work?.manifestations?.all.filter(m =>
      isPhysicalMaterialType(m.materialTypes[0]?.materialTypeSpecific.code)
    ) ?? []
  const recordIds = getFaustIdsFromManifestations(physicalManifestations)

  const { data: patron } = usePatron()
  const { data: availability } = useMaterialAvailability(wid, recordIds, {
    enabled: recordIds.length > 0,
  })
  const { data: reservations } = useReservations({ refetchOnMount: "always" })

  const { mutate: createReservation, isPending: isSubmitting } = useCreateReservation()
  const [failureResult, setFailureResult] = useState<CreateReservationFailed | null>(null)
  const [successResult, setSuccessResult] = useState<CreateReservationSuccess | null>(null)

  // The receipt step is derivable: either we just succeeded (local state)
  // or the patron already has a reservation for this manifestation
  // (server state).
  const existingReservation = getReservationByRecordId(reservations, recordId)
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

  const handleApprove = useCallback(() => {
    if (!recordId || isSubmitting) return
    setFailureResult(null)
    createReservation(
      {
        recordId,
        ...(patron?.pickupBranchId ? { pickupBranchId: patron.pickupBranchId } : {}),
      },
      {
        onSuccess: (result: CreateReservationResult) => {
          if (result.status === "success") {
            setSuccessResult(result)
          } else {
            setFailureResult(result)
          }
        },
        onError: () => {
          // Network / non-JSON — surface via the "unknown" copy bucket.
          setFailureResult({ status: "failed", recordId, reason: "unknown" })
        },
      }
    )
  }, [recordId, isSubmitting, patron?.pickupBranchId, createReservation])

  const submitDisabled = isSubmitting || !recordId

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={(manifestation && `Reserver ${getManifestationLabel(manifestation)}`) || ""}>
      <AnimateChangeInHeight>
        {manifestation && work && (
          <div data-cy={cyKeys["reservation-modal"]}>
            {failureResult ? (
              <ReservationErrorContent
                manifestation={manifestation}
                reason={failureResult.reason}
              />
            ) : isReceiptStep && derivedResult ? (
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
      </AnimateChangeInHeight>

      <ResponsiveDialog.Actions>
        {failureResult ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            Luk
          </Button>
        ) : isReceiptStep ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            OK
          </Button>
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
            {availability && (
              <p className="text-typo-caption text-foreground-muted max-w-prose text-center">
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
