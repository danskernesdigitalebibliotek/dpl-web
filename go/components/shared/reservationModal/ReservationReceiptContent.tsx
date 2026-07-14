"use client"

import type {
  CreateReservationSuccess,
  Patron,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import ReceiptStat from "@/components/shared/receiptStat/ReceiptStat"
import { cyKeys } from "@/cypress/support/constants"
import { useBranchTitle } from "@/hooks/useBranchTitle"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type Manifestation = NonNullable<
  NonNullable<GetMaterialQuery["work"]>["manifestations"]["all"]
>[number]

type ReservationReceiptProps = {
  manifestation: Manifestation
  result: CreateReservationSuccess
  patron: Patron | undefined
}

const ReservationReceiptContent = ({ manifestation, result, patron }: ReservationReceiptProps) => {
  const title = manifestation.titles?.full?.[0] ?? getManifestationLabel(manifestation)
  const { data: branchTitle, isSuccess: branchLoaded } = useBranchTitle(result.pickupBranchId)
  const pickupBranchName = branchTitle ?? (branchLoaded ? "Afhentningssted blev ikke fundet" : "")

  return (
    <div
      data-cy={cyKeys["reservation-receipt"]}
      className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
      <ManifestationCover
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        className="w-32 shrink-0"
      />
      <div className="flex flex-col gap-y-4">
        <h2 className="text-typo-heading-4 mt-2 first-letter:uppercase">
          {getManifestationLabel(manifestation, "definite")} er nu reserveret til dig!
        </h2>
        <p className="text-typo-subtitle-md text-foreground-muted">
          &ldquo;{title}&rdquo; er reserveret til dig.
        </p>
        <NotificationLine
          email={patron?.emailAddress}
          phone={patron?.phoneNumber}
          branchName={pickupBranchName}
        />
      </div>

      <dl className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <ReceiptStat
          term="Dit nummer i køen"
          value={result.numberInQueue !== undefined ? String(result.numberInQueue) : "—"}
          dataCy={cyKeys["reservation-receipt-queue-position"]}
        />
        <ReceiptStat
          term={`${getManifestationLabel(manifestation, "definite")} skal hentes på`}
          value={pickupBranchName}
          dataCy={cyKeys["reservation-receipt-pickup-branch"]}
        />
      </dl>
    </div>
  )
}

const NotificationLine = ({
  email,
  phone,
  branchName,
}: {
  email: string | undefined
  phone: string | undefined
  branchName: string
}) => {
  if (!email && !phone) return null
  if (!branchName) return null

  const branchSuffix = (
    <>
      , når bogen er klar til afhentning på <span className="font-medium">{branchName}</span>.
    </>
  )

  if (email && phone) {
    return (
      <p className="text-typo-subtitle-md text-foreground-muted">
        Du får besked på <span className="font-medium">{email}</span> og på{" "}
        <span className="font-medium">{phone}</span>
        {branchSuffix}
      </p>
    )
  }

  return (
    <p className="text-typo-subtitle-md text-foreground-muted">
      Du får besked på <span className="font-medium">{email ?? phone}</span>
      {branchSuffix}
    </p>
  )
}

export default ReservationReceiptContent
