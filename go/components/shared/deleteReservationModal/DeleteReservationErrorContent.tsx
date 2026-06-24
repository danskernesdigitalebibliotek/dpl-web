"use client"

import React from "react"

import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { cyKeys } from "@/cypress/support/constants"
import type { Cover } from "@/lib/graphql/generated/fbi/graphql"

type Props = {
  cover: Cover
}

// Deletion failures from FBS arrive as a generic thrown error (no reason
// codes), so there is a single user-facing message — unlike the reservation
// flow's reason-bucketed copy.
const DeleteReservationErrorContent = ({ cover }: Props) => (
  <div
    data-cy={cyKeys["delete-reservation-error"]}
    className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
    <ManifestationCover cover={cover} iconName="book" className="aspect-[4/5] w-32 shrink-0" />
    <div className="flex flex-col gap-y-4">
      <h2 className="text-typo-heading-4 mt-2">Reservationen kunne ikke slettes</h2>
      <p className="text-typo-subtitle-md text-foreground-muted">
        Noget gik galt. Prøv igen senere.
      </p>
    </div>
  </div>
)

export default DeleteReservationErrorContent
