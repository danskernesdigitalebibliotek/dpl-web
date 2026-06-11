"use client"

import type { CreateReservationSuccess } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
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
      <div
        className="rounded-base relative flex aspect-1/1 h-36 w-full flex-col items-center
          justify-center lg:aspect-4/5">
        <CoverPicture alt="Forsidebillede på værket" covers={manifestation.cover} />
        <MaterialTypeIconWrapper
          iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
          className="bg-background absolute -bottom-6 h-10 w-10 outline-1"
        />
      </div>

      <div className="mx-auto mt-10 mb-6 w-full max-w-prose space-y-6 text-center">
        <p className="text-typo-subtitle-md">
          &ldquo;{title}&rdquo; er reserveret til dig.
        </p>

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

const ReceiptStat = ({
  term,
  value,
  dataCy,
}: {
  term: string
  value: string
  dataCy: string
}) => (
  <div className="bg-background-skeleton/40 rounded-base px-6 py-4" data-cy={dataCy}>
    <dt className="text-typo-body-sm text-foreground/70">{term}</dt>
    <dd className="text-typo-subtitle-md mt-1">{value}</dd>
  </div>
)

export default ReservationReceipt
