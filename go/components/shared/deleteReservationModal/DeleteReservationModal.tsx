"use client"

import {
  useDeleteReservation,
  useReservations,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useState } from "react"

import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { ModalViewTransition } from "@/components/shared/modalViewTransition/ModalViewTransition"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { findReservationByRecordId } from "@/lib/helpers/helper.reservation"
import { pidToFaust } from "@/lib/helpers/ids"

type Props = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const DeleteReservationModal = ({ open, onClose, wid, pid }: Props) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = findManifestationByPid(data?.work, pid)
  const recordId = manifestation ? pidToFaust(manifestation.pid) : null

  const { data: reservations } = useReservations()
  const reservation = findReservationByRecordId(reservations, recordId)

  const { mutate: deleteReservation, isPending: isSubmitting } = useDeleteReservation()
  const [deletionSucceeded, setDeletionSucceeded] = useState(false)

  // Receipt is only shown after the user actually confirmed deletion in this
  // session. Inferring it from cache absence would flash the success state
  // whenever the cached reservations list is already stale (e.g. another tab
  // deleted, cold cache reopen).
  const isReceiptStep = deletionSucceeded

  const handleDelete = () => {
    if (!reservation || isSubmitting) return
    deleteReservation(reservation.reservationId, {
      onSuccess: () => setDeletionSucceeded(true),
      onError: () => toast.error("Reservationen kunne ikke slettes. Prøv igen senere."),
    })
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Slet reservering">
      {/* The view transition only slides horizontally, so clip x only; the
          negative margin + padding give cover shadows room at the edges. */}
      <AnimateChangeInHeight className="-mx-6 overflow-x-clip px-6">
        {manifestation && (
          <ModalViewTransition viewKey={isReceiptStep ? "receipt" : "confirm"}>
            {isReceiptStep ? (
              <DeleteReservationReceiptContent cover={manifestation.cover} />
            ) : (
              <div
                data-cy={cyKeys["delete-reservation-modal"]}
                className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
                <ManifestationCover
                  cover={manifestation.cover}
                  iconName="book"
                  className="w-32 shrink-0"
                />
                <div className="flex flex-col gap-y-3">
                  <p className="text-typo-heading-5">Vil du slette din reservering?</p>
                  <p className="text-typo-subtitle-md text-foreground-muted">
                    Du kan ikke fortryde.
                  </p>
                </div>
              </div>
            )}
          </ModalViewTransition>
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
