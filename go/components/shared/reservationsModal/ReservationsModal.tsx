"use client"

import { useDeleteReservation } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import DeleteReservationConfirmContent from "@/components/shared/deleteReservationModal/DeleteReservationConfirmContent"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import ModalMaterialList from "@/components/shared/modalMaterialList/ModalMaterialList"
import ModalMaterialListItem from "@/components/shared/modalMaterialList/ModalMaterialListItem"
import ReservationDetailsContent, {
  ReservationStatus,
  isReadyForPickup,
} from "@/components/shared/reservationsModal/ReservationDetailsContent"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { type ReservationItem } from "@/lib/helpers/helper.patron"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type ReservationsModalProps = {
  items: ReservationItem[]
}

const ReservationRow = ({ item, onSelect }: { item: ReservationItem; onSelect: () => void }) => {
  const { work, manifestation } = item
  const title = work.titles.full[0]

  return (
    <ModalMaterialListItem
      manifestation={manifestation}
      title={title}
      creators={displayCreators(work.creators, 1)}
      onSelect={onSelect}
      status={<ReservationStatus item={item} />}
    />
  )
}

// One dialog with four views: reservations list, "Din reservering"
// details, the deletion confirm step, and the deletion receipt.
const ReservationsModal = ({
  open,
  onClose,
  items,
}: ReservationsModalProps & { open: boolean; onClose: () => void }) => {
  const [selected, setSelected] = useState<ReservationItem | null>(null)
  const flow = useModalFlow<"list" | "details" | "confirm" | "receipt">({ initial: "list" })

  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation()

  const ready = items.filter(item => isReadyForPickup(item.reservation))
  const queued = items.filter(item => !isReadyForPickup(item.reservation))

  const goBack = () => {
    // Only release the selection once we are back at the list.
    if (flow.back() === "list") setSelected(null)
  }

  const selectItem = (item: ReservationItem) => {
    setSelected(item)
    flow.goTo("details")
  }

  const handleDelete = () => {
    if (!selected || isDeleting) return
    deleteReservation(selected.reservation.reservationId, {
      onSuccess: () => flow.goTo("receipt"),
      onError: () => toast.error("Reservationen kunne ikke slettes. Prøv igen senere."),
    })
  }

  const titleText =
    flow.view === "receipt" || flow.view === "confirm"
      ? "Slet reservering"
      : flow.view === "details"
        ? "Din reservering"
        : `Reserveringer (${items.length})`

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      onBack={flow.view === "details" || flow.view === "confirm" ? goBack : undefined}
      viewDirection={flow.direction}
      title={flow.animatedTitle(titleText)}>
      {flow.renderBody(
        flow.view === "receipt" && selected ? (
          <DeleteReservationReceiptContent cover={selected.manifestation.cover} />
        ) : flow.view === "confirm" && selected ? (
          <DeleteReservationConfirmContent cover={selected.manifestation.cover} />
        ) : flow.view === "details" && selected ? (
          <ReservationDetailsContent item={selected} />
        ) : (
          <div data-cy={cyKeys["reservations-modal"]} className="space-y-10">
            {ready.length > 0 && (
              <ModalMaterialList heading={`Klar til afhentning (${ready.length})`}>
                {ready.map(item => (
                  <ReservationRow
                    key={item.reservation.reservationId}
                    item={item}
                    onSelect={() => selectItem(item)}
                  />
                ))}
              </ModalMaterialList>
            )}
            {queued.length > 0 && (
              <ModalMaterialList heading={`I kø (${queued.length})`}>
                {queued.map(item => (
                  <ReservationRow
                    key={item.reservation.reservationId}
                    item={item}
                    onSelect={() => selectItem(item)}
                  />
                ))}
              </ModalMaterialList>
            )}
          </div>
        )
      )}

      {selected && (
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
              <Button size="lg" onClick={goBack} disabled={isDeleting}>
                Annuller
              </Button>
            </>
          ) : (
            <Button
              theme="primary"
              size="lg"
              data-cy={cyKeys["delete-reservation-button"]}
              onClick={() => flow.goTo("confirm")}>
              Slet reservering
            </Button>
          )}
        </ResponsiveDialog.Actions>
      )}
    </ResponsiveDialog>
  )
}

export default ReservationsModal
