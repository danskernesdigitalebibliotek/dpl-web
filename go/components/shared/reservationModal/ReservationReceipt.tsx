"use client"

import type { CreateReservationSuccess } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { cyKeys } from "@/cypress/support/constants"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type Manifestation = NonNullable<
  NonNullable<GetMaterialQuery["work"]>["manifestations"]["all"]
>[number]

type ReservationReceiptProps = {
  manifestation: Manifestation
  result: CreateReservationSuccess
}

const ReservationReceipt = ({ manifestation, result }: ReservationReceiptProps) => {
  const title = manifestation.titles?.full?.[0] ?? getManifestationLabel(manifestation)

  return (
    <div data-cy={cyKeys["reservation-receipt"]}>
      <ManifestationCover
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        className="rounded-base flex aspect-1/1 h-36 w-full flex-col items-center justify-center
          lg:aspect-4/5"
      />

      <div className="mx-auto mt-10 mb-6 w-full max-w-prose space-y-6 text-center">
        <p className="text-typo-subtitle-md">&ldquo;{title}&rdquo; er reserveret til dig.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReceiptStat
            term="Dit nummer i køen"
            value={result.numberInQueue !== undefined ? String(result.numberInQueue) : "—"}
            dataCy={cyKeys["reservation-receipt-queue-position"]}
          />
          <ReceiptStat
            term="Bogen skal hentes på"
            value={result.pickupBranchId}
            dataCy={cyKeys["reservation-receipt-pickup-branch"]}
          />
        </div>
      </div>
    </div>
  )
}

const ReceiptStat = ({ term, value, dataCy }: { term: string; value: string; dataCy: string }) => (
  <div className="bg-background-skeleton/40 rounded-base px-6 py-4" data-cy={dataCy}>
    <p className="text-typo-subtitle-sm text-foreground/70 dark:text-foreground/90">{term}</p>
    <p className="text-typo-subtitle-md mt-1">{value}</p>
  </div>
)

export default ReservationReceipt
