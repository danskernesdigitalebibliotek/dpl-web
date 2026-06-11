"use client"

import { useMaterialAvailability, usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  getManifestationMaterialTypeIcon,
  isPhysicalMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { getFaustIdsFromManifestations } from "@/lib/helpers/ids"

type Work = NonNullable<GetMaterialQuery["work"]>
type Manifestation = NonNullable<Work["manifestations"]["all"]>[number]

type ReservationFormProps = {
  wid: string
  work: Work
  manifestation: Manifestation
  errorMessage?: string
}

const ReservationForm = ({ wid, work, manifestation, errorMessage }: ReservationFormProps) => {
  const physicalManifestations =
    work?.manifestations?.all.filter(m =>
      isPhysicalMaterialType(m.materialTypes[0]?.materialTypeSpecific.code)
    ) ?? []
  const recordIds = getFaustIdsFromManifestations(physicalManifestations)

  const { data: patron } = usePatron()
  const { data: availability } = useMaterialAvailability(wid, recordIds)

  return (
    <>
      <div
        className="rounded-base relative flex aspect-1/1 h-36 w-full flex-col items-center
          justify-center lg:aspect-4/5">
        <CoverPicture alt="Forsidebillede på værket" covers={manifestation.cover} />
        <MaterialTypeIconWrapper
          iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
          className="bg-background absolute -bottom-6 h-10 w-10 outline-1"
        />
      </div>

      <div className="mx-auto mt-10 mb-5 w-full max-w-prose space-y-4">
        <p className="text-typo-subtitle-md text-center">{manifestation.titles?.full || ""}</p>

        {availability && (
          <dl className="text-typo-body-sm space-y-2">
            <ReservationRow term="Eksemplarer">{availability.totalCopies}</ReservationRow>
            <ReservationRow term="Reservationer">{availability.reservationCount}</ReservationRow>
          </dl>
        )}

        {patron && (
          <dl className="text-typo-body-sm space-y-2">
            <ReservationRow term="Afhentningssted">
              {patron.preferredPickupBranchId}
            </ReservationRow>
            {patron.emailAddress && (
              <ReservationRow term="E-mail">{patron.emailAddress}</ReservationRow>
            )}
            {patron.phoneNumber && (
              <ReservationRow term="Telefonnummer">{patron.phoneNumber}</ReservationRow>
            )}
          </dl>
        )}

        {errorMessage && (
          <p className="text-typo-body-sm text-center text-red-600">{errorMessage}</p>
        )}
      </div>
    </>
  )
}

const ReservationRow = ({ term, children }: { term: string; children: React.ReactNode }) => (
  <div className="flex flex-row justify-between gap-4">
    <dt className="text-foreground/70">{term}</dt>
    <dd>{children}</dd>
  </div>
)

export default ReservationForm
