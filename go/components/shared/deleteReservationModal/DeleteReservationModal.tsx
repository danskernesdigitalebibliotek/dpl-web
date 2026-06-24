"use client"

import {
  useDeleteReservation,
  useReservations,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useState } from "react"

import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import DeleteReservationErrorContent from "@/components/shared/deleteReservationModal/DeleteReservationErrorContent"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
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
  const [hasFailed, setHasFailed] = useState(false)
  const [deletionSucceeded, setDeletionSucceeded] = useState(false)

  // Receipt is only shown after the user actually confirmed deletion in this
  // session. Inferring it from cache absence would flash the success state
  // whenever the cached reservations list is already stale (e.g. another tab
  // deleted, cold cache reopen).
  const isReceiptStep = deletionSucceeded

  const handleDelete = () => {
    if (!reservation || isSubmitting) return
    setHasFailed(false)
    deleteReservation(reservation.reservationId, {
      onSuccess: () => setDeletionSucceeded(true),
      onError: () => setHasFailed(true),
    })
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Slet reservering">
      <AnimateChangeInHeight>
        {manifestation &&
          (hasFailed ? (
            <DeleteReservationErrorContent cover={manifestation.cover} />
          ) : isReceiptStep ? (
            <DeleteReservationReceiptContent cover={manifestation.cover} />
          ) : (
            <div
              data-cy={cyKeys["delete-reservation-modal"]}
              className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
              <ManifestationCover
                cover={manifestation.cover}
                iconName="book"
                className="aspect-[4/5] w-32 shrink-0"
              />
              <div className="flex flex-col gap-y-3">
                <p className="text-typo-heading-5">Vil du slette din reservering?</p>
                <p className="text-typo-subtitle-md text-foreground-muted">Du kan ikke fortryde.</p>
              </div>
            </div>
          ))}
      </AnimateChangeInHeight>

      <ResponsiveDialog.Actions>
        {hasFailed ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            Luk
          </Button>
        ) : isReceiptStep ? (
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
