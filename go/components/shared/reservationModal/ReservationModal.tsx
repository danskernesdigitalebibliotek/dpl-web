"use client"

import {
  type CreateReservationInput,
  type CreateReservationResult,
  type CreateReservationSuccess,
  materialAvailabilityQueryKey,
  usePatron,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useState } from "react"

import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import ReservationForm from "@/components/shared/reservationModal/ReservationForm"
import ReservationReceipt from "@/components/shared/reservationModal/ReservationReceipt"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { pidToFaust } from "@/lib/helpers/ids"

type ReservationModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

type Step = "reserve" | "receipt"

// Client-side mutation against the local route handler. We avoid useActionState
// here because server actions trigger an automatic RSC tree refresh on success,
// which visibly flashes the work page when the reservation completes.
async function postReservation(input: CreateReservationInput): Promise<CreateReservationResult> {
  const response = await fetch("/api/reservation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })
  const body: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : `Reservationen fejlede (${response.status})`
    throw new Error(message)
  }
  return (body as { result: CreateReservationResult }).result
}

const ReservationModal = ({ open, onClose, wid, pid }: ReservationModalProps) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const work = data?.work
  const manifestation = work?.manifestations?.all?.find(m => m.pid === pid)
  const reservationRecordId = manifestation ? pidToFaust(manifestation.pid) : null

  const { data: patron } = usePatron()

  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>("reserve")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [successResult, setSuccessResult] = useState<CreateReservationSuccess | null>(null)

  const handleApprove = useCallback(async () => {
    if (!reservationRecordId || isSubmitting) return
    setIsSubmitting(true)
    setErrorMessage(undefined)
    try {
      const result = await postReservation({
        recordId: reservationRecordId,
        ...(patron?.preferredPickupBranchId
          ? { pickupBranchId: patron.preferredPickupBranchId }
          : {}),
      })
      if (result.status === "success") {
        setSuccessResult(result)
        setStep("receipt")
        queryClient.invalidateQueries({ queryKey: materialAvailabilityQueryKey(wid) })
      } else {
        setErrorMessage(`Reservationen kunne ikke gennemføres (${result.reason}).`)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Reservationen kunne ikke gennemføres.")
    } finally {
      setIsSubmitting(false)
    }
  }, [reservationRecordId, isSubmitting, patron?.preferredPickupBranchId, queryClient, wid])

  const title =
    step === "receipt"
      ? "Bogen er nu reserveret til dig!"
      : (manifestation && `Reserver ${getManifestationLabel(manifestation)}`) || ""

  return (
    <ResponsiveDialog open={open} onClose={onClose} title={title}>
      <AnimateChangeInHeight>
        {manifestation && work && (
          <div data-cy={cyKeys["reservation-modal"]}>
            {step === "receipt" && successResult ? (
              <ReservationReceipt
                manifestation={manifestation}
                result={successResult}
                onClose={onClose}
              />
            ) : (
              <ReservationForm
                wid={wid}
                work={work}
                manifestation={manifestation}
                errorMessage={errorMessage}
                isSubmitting={isSubmitting || !reservationRecordId}
                onApprove={handleApprove}
                onCancel={onClose}
              />
            )}
          </div>
        )}
      </AnimateChangeInHeight>
    </ResponsiveDialog>
  )
}

export default ReservationModal
