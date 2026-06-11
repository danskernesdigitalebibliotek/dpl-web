"use client"

import { useMaterialAvailability, usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  getManifestationMaterialTypeIcon,
  isPhysicalMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { getFaustIdsFromManifestations } from "@/lib/helpers/ids"

type Work = NonNullable<GetMaterialQuery["work"]>
type Manifestation = NonNullable<Work["manifestations"]["all"]>[number]

type ReservationFormProps = {
  wid: string
  work: Work
  manifestation: Manifestation
  errorMessage?: string
  isSubmitting: boolean
  onApprove: () => void
  onCancel: () => void
}

const ReservationForm = ({
  wid,
  work,
  manifestation,
  errorMessage,
  isSubmitting,
  onApprove,
  onCancel,
}: ReservationFormProps) => {
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

      <div className="flex flex-row items-center justify-center gap-6">
        <Button
          theme="primary"
          size="lg"
          data-cy={cyKeys["approve-reservation-button"]}
          onClick={onApprove}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <Icon
              name="go-spinner"
              ariaLabel="Indlæser"
              className="animate-spin-reverse h-[24px] w-[24px]"
            />
          ) : (
            "Godkend reservation"
          )}
        </Button>
        <Button size="lg" onClick={onCancel} disabled={isSubmitting}>
          Annuller
        </Button>
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
