"use client"

import { useDeleteReservation } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useRef } from "react"

import { Button } from "@/components/shared/button/Button"
import DeleteReservationConfirmContent from "@/components/shared/deleteReservationModal/DeleteReservationConfirmContent"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import ReservationDetailsContent from "@/components/shared/reservationsModal/ReservationDetailsContent"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import usePatronShelf from "@/hooks/usePatronShelf"

// Data props — `open`/`onClose` come from the DynamicModal host. The work
// page opens this with the FBS record id (FAUST) of the reserved material.
export type ReservationDetailsModalProps = {
  recordId: string
}

const BodySkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-background-skeleton rounded-base h-[76px] animate-pulse" />
    ))}
  </div>
)

// The work page's "Din reservering": the same details view as the profile
// reservations modal, followed by the deletion confirm step and receipt.
const ReservationDetailsModal = ({
  open,
  onClose,
  recordId,
}: ReservationDetailsModalProps & { open: boolean; onClose: () => void }) => {
  const flow = useModalFlow<"details" | "confirm" | "receipt">({ initial: "details" })
  const { reservationItems } = usePatronShelf()
  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation()

  // Deletion removes the reservation from the shelf, so hold on to the last
  // match to keep rendering the receipt.
  const found = reservationItems.find(item => item.reservation.recordId === recordId)
  const lastFound = useRef(found)
  if (found) lastFound.current = found
  const item = found ?? lastFound.current

  const handleDelete = () => {
    if (!item || isDeleting) return
    deleteReservation(item.reservation.reservationId, {
      onSuccess: () => flow.goTo("receipt"),
      onError: () => toast.error("Reservationen kunne ikke slettes. Prøv igen senere."),
    })
  }

  const titleText = flow.view === "details" ? "Din reservering" : "Slet reservering"

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      onBack={flow.view === "confirm" ? flow.back : undefined}
      viewDirection={flow.direction}
      title={flow.animatedTitle(titleText)}>
      {flow.renderBody(
        !item ? (
          <BodySkeleton />
        ) : flow.view === "receipt" ? (
          <DeleteReservationReceiptContent cover={item.manifestation.cover} />
        ) : flow.view === "confirm" ? (
          <DeleteReservationConfirmContent cover={item.manifestation.cover} />
        ) : (
          <ReservationDetailsContent item={item} />
        )
      )}

      <ResponsiveDialog.Actions>
        {flow.view === "receipt" ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            OK
          </Button>
        ) : flow.view === "confirm" ? (
          <>
            <Button
              theme="primary"
              size="lg"
              data-cy={cyKeys["approve-delete-reservation-button"]}
              onClick={handleDelete}
              disabled={isDeleting}
              isLoading={isDeleting}>
              Slet reservering
            </Button>
            <Button size="lg" onClick={() => flow.back()} disabled={isDeleting}>
              Annuller
            </Button>
          </>
        ) : (
          <Button
            theme="primary"
            size="lg"
            data-cy={cyKeys["delete-reservation-button"]}
            disabled={!item}
            onClick={() => flow.goTo("confirm")}>
            Slet reservering
          </Button>
        )}
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default ReservationDetailsModal
