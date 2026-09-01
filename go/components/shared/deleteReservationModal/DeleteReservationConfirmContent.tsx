"use client"

import React from "react"

import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { cyKeys } from "@/cypress/support/constants"
import type { Cover } from "@/lib/graphql/generated/fbi/graphql"

type Props = {
  cover: Cover
}

// The "are you sure" step shared by the deletion flows.
const DeleteReservationConfirmContent = ({ cover }: Props) => (
  <div
    data-cy={cyKeys["delete-reservation-modal"]}
    className="flex flex-col items-center gap-y-8 text-center">
    <ManifestationCover cover={cover} iconName="book" className="w-32 shrink-0 md:w-36" />
    <div className="flex flex-col gap-y-3">
      <p className="text-typo-heading-5">Vil du slette din reservering?</p>
      <p className="text-typo-subtitle-md text-foreground-muted">Du kan ikke fortryde.</p>
    </div>
  </div>
)

export default DeleteReservationConfirmContent
