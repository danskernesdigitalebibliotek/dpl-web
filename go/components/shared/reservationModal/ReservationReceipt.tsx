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
    <div
      data-cy={cyKeys["reservation-receipt"]}
      className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
      <ManifestationCover
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        className="aspect-[4/5] w-32 shrink-0"
      />
      <div className="flex flex-col gap-y-4">
        <h2 className="text-typo-heading-4 mt-2 text-balance first-letter:uppercase">
          {getManifestationLabel(manifestation, "definite")} er nu reserveret til dig!
        </h2>
        <p className="text-typo-subtitle-md text-foreground/70 dark:text-foreground/90 text-balance">
          &ldquo;{title}&rdquo; er reserveret til dig.
        </p>
      </div>

      <dl className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <ReceiptStat
          term="Dit nummer i køen"
          value={result.numberInQueue !== undefined ? String(result.numberInQueue) : "—"}
          dataCy={cyKeys["reservation-receipt-queue-position"]}
        />
        <ReceiptStat
          term={`${getManifestationLabel(manifestation, "definite")} skal hentes på`}
          value={result.pickupBranchId}
          dataCy={cyKeys["reservation-receipt-pickup-branch"]}
        />
      </dl>
    </div>
  )
}

const ReceiptStat = ({ term, value, dataCy }: { term: string; value: string; dataCy: string }) => (
  // eslint-disable-next-line no-restricted-syntax -- dataCy comes from cyKeys at call site
  <div className="bg-background-skeleton/40 rounded-base px-6 py-5 text-center" data-cy={dataCy}>
    <dt
      className="text-typo-caption text-foreground/70 dark:text-foreground/90
        first-letter:uppercase">
      {term}
    </dt>
    <dd className="text-typo-heading-5 mt-2">{value}</dd>
  </div>
)

export default ReservationReceipt
