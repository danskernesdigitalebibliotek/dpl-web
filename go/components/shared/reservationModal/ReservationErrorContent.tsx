"use client"

import type { FailureReason } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { cyKeys } from "@/cypress/support/constants"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type Manifestation = NonNullable<
  NonNullable<GetMaterialQuery["work"]>["manifestations"]["all"]
>[number]

type ReservationErrorProps = {
  manifestation: Manifestation
  reason: FailureReason
}

const GENERIC_MESSAGE = "Reservationen kunne ikke gennemføres. Prøv igen senere."

// Single source of truth for failure-code → Danish copy. Several FBS codes
// collapse to the same user-facing message because the user can't act on the
// distinction (e.g. material_lost vs material_discarded).
const REASON_COPY: Record<FailureReason, string> = {
  already_reserved: "Du har allerede reserveret denne bog.",
  patron_is_blocked: "Din konto er spærret. Kontakt biblioteket.",
  patron_not_found: "Vi kunne ikke finde din konto.",
  material_not_reservable: "Bogen kan ikke reserveres lige nu.",
  not_reservable: "Bogen kan ikke reserveres lige nu.",
  interlibrary_material_not_reservable: "Bogen kan ikke reserveres lige nu.",
  material_not_loanable: "Bogen kan ikke reserveres lige nu.",
  no_reservable_materials: "Bogen kan ikke reserveres lige nu.",
  already_loaned: "Du har allerede lånt denne bog.",
  previously_loaned_by_homebound_patron: "Du har allerede lånt denne bog.",
  material_lost: "Bogen er ikke længere tilgængelig.",
  material_discarded: "Bogen er ikke længere tilgængelig.",
  material_not_found: "Bogen er ikke længere tilgængelig.",
  exceeds_max_reservations: "Du har nået det maksimale antal reservationer.",
  loaning_profile_not_found: GENERIC_MESSAGE,
  material_part_of_collection: GENERIC_MESSAGE,
  unknown: GENERIC_MESSAGE,
}

const ReservationErrorContent = ({ manifestation, reason }: ReservationErrorProps) => {
  const message = REASON_COPY[reason] ?? GENERIC_MESSAGE

  return (
    <div
      data-cy={cyKeys["reservation-error"]}
      data-reason={reason}
      className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
      <ManifestationCover
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        className="aspect-[4/5] w-32 shrink-0"
      />
      <div className="flex flex-col gap-y-4">
        <h2 className="text-typo-heading-4 mt-2">Reservationen kunne ikke gennemføres</h2>
        <p className="text-typo-subtitle-md text-foreground-muted">{message}</p>
      </div>
    </div>
  )
}

export default ReservationErrorContent
