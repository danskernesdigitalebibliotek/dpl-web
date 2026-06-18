"use client"

import {
  materialAvailabilityQueryKey,
  reservationsQueryKey,
  useReservations,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useState } from "react"

import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { getManifestationByPid } from "@/lib/graphql/selectors/manifestation"
import { getReservationByRecordId } from "@/lib/graphql/selectors/reservation"
import { pidToFaust } from "@/lib/helpers/ids"

type Props = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

async function deleteReservationRequest(reservationId: number): Promise<void> {
  const response = await fetch(`/api/reservation/${reservationId}`, { method: "DELETE" })
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => ({}))
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : `Sletning fejlede (${response.status})`
    throw new Error(message)
  }
}

const DeleteReservationModal = ({ open, onClose, wid, pid }: Props) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = getManifestationByPid(data?.work, pid)
  const recordId = manifestation ? pidToFaust(manifestation.pid) : null

  const { data: reservations } = useReservations({ refetchOnMount: "always" })
  const reservation = getReservationByRecordId(reservations, recordId)

  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [justDeleted, setJustDeleted] = useState(false)

  // Receipt is derivable: either we just deleted, or the reservation is gone
  // from server state. Guard on having a recordId and a resolved reservations
  // list so we don't flash receipt during initial hydration.
  const isReceiptStep =
    justDeleted || (reservations !== undefined && recordId !== null && !reservation)

  const handleDelete = useCallback(async () => {
    if (!reservation || isSubmitting) return
    setIsSubmitting(true)
    setErrorMessage(undefined)
    try {
      await deleteReservationRequest(reservation.reservationId)
      setJustDeleted(true)
      queryClient.invalidateQueries({ queryKey: reservationsQueryKey() })
      queryClient.invalidateQueries({ queryKey: materialAvailabilityQueryKey(wid) })
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Reservationen kunne ikke slettes.")
    } finally {
      setIsSubmitting(false)
    }
  }, [reservation, isSubmitting, queryClient, wid])

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Slet reservering">
      <AnimateChangeInHeight>
        {manifestation && (
          <div
            // eslint-disable-next-line no-restricted-syntax
            data-cy={
              isReceiptStep
                ? cyKeys["delete-reservation-receipt"]
                : cyKeys["delete-reservation-modal"]
            }
            className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
            <ManifestationCover
              cover={manifestation.cover}
              iconName="book"
              className="aspect-[4/5] w-32 shrink-0"
            />
            {isReceiptStep ? (
              <p className="text-typo-heading-5">Din reservering er nu slettet</p>
            ) : (
              <div className="flex flex-col gap-y-3">
                <p className="text-typo-heading-5">Vil du slette din reservering?</p>
                <p className="text-typo-subtitle-md text-foreground-muted">Du kan ikke fortryde.</p>
                {errorMessage && <p className="text-typo-body-sm text-red-600">{errorMessage}</p>}
              </div>
            )}
          </div>
        )}
      </AnimateChangeInHeight>

      <ResponsiveDialog.Actions>
        {isReceiptStep ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            OK
          </Button>
        ) : (
          <>
            <Button
              theme="primary"
              size="lg"
              data-cy={cyKeys["approve-delete-reservation-button"]}
              onClick={handleDelete}
              disabled={isSubmitting || !reservation}
              isLoading={isSubmitting}>
              Slet reservering
            </Button>
            <Button size="lg" onClick={onClose} disabled={isSubmitting}>
              Annuller
            </Button>
          </>
        )}
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default DeleteReservationModal
