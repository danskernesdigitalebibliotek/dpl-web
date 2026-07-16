"use client"

import { useDeleteReservation } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { ModalFlowBody } from "@/components/shared/modalFlow/ModalFlowBody"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { Cover } from "@/lib/graphql/generated/fbi/graphql"

// Data props — the caller holds the reserved manifestation's cover and the
// reservation to delete.
export type DeleteReservationModalProps = {
  cover: Cover
  reservationId: number
}

const DeleteReservationModal = ({
  open,
  onClose,
  cover,
  reservationId,
}: DeleteReservationModalProps & { open: boolean; onClose: () => void }) => {
  const { mutate: deleteReservation, isPending: isSubmitting } = useDeleteReservation()
  const [deletionSucceeded, setDeletionSucceeded] = useState(false)

  // Receipt is only shown after the user actually confirmed deletion in this
  // session. Inferring it from cache absence would flash the success state
  // whenever the cached reservations list is already stale (e.g. another tab
  // deleted, cold cache reopen).
  const isReceiptStep = deletionSucceeded

  const handleDelete = () => {
    if (isSubmitting) return
    deleteReservation(reservationId, {
      onSuccess: () => setDeletionSucceeded(true),
      onError: () => toast.error("Reservationen kunne ikke slettes. Prøv igen senere."),
    })
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Slet reservering">
      <ModalFlowBody viewKey={isReceiptStep ? "receipt" : "confirm"}>
        {isReceiptStep ? (
          <DeleteReservationReceiptContent cover={cover} />
        ) : (
          <div
            data-cy={cyKeys["delete-reservation-modal"]}
            className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
            <ManifestationCover cover={cover} iconName="book" className="w-32 shrink-0" />
            <div className="flex flex-col gap-y-3">
              <p className="text-typo-heading-5">Vil du slette din reservering?</p>
              <p className="text-typo-subtitle-md text-foreground-muted">Du kan ikke fortryde.</p>
            </div>
          </div>
        )}
      </ModalFlowBody>

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
              disabled={isSubmitting}
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
