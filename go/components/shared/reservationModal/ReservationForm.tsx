"use client"

import type { Patron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import Icon from "@/components/shared/icon/Icon"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { useGetBranchQuery } from "@/lib/graphql/generated/dpl-cms/graphql"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"

type Work = NonNullable<GetMaterialQuery["work"]>
type Manifestation = NonNullable<Work["manifestations"]["all"]>[number]

type ReservationFormProps = {
  work: Work
  manifestation: Manifestation
  patron: Patron | undefined
  errorMessage?: string
}

const ReservationForm = ({ work, manifestation, patron, errorMessage }: ReservationFormProps) => {
  const creators = work?.creators ?? manifestation.contributors ?? []
  const authorLabel = creators.length > 0 ? `Af ${displayCreators(creators, 3)}` : null
  const materialIcon = getManifestationMaterialTypeIcon(manifestation) || "book"
  const manifestationTitle = manifestation.titles?.full?.[0] ?? getManifestationLabel(manifestation)
  const { data: branch } = useGetBranchQuery(
    { isilId: patron?.pickupBranchId ?? "" },
    {
      enabled: !!patron?.pickupBranchId,
      staleTime: Infinity,
      select: data => data.getBranch,
    }
  )
  const pickupBranchName = branch?.title ?? patron?.pickupBranchId ?? ""

  return (
    <div className="mx-auto max-w-prose space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <ManifestationCover
          cover={manifestation.cover}
          iconName={materialIcon}
          className="mx-auto aspect-[4/5] w-32 shrink-0 lg:mx-0"
        />

        <div className="mt-auto flex flex-1 flex-col gap-2 text-center lg:text-left">
          <p className="text-typo-heading-5">{manifestationTitle}</p>
          {authorLabel && (
            <p className="text-typo-subtitle-sm text-foreground/70 dark:text-foreground/90">
              {authorLabel}
            </p>
          )}
        </div>
      </div>

      <hr className="border-foreground/10" />

      <div className="space-y-4">
        <InfoCard
          icon="pin"
          title="Afhentningssted"
          value={pickupBranchName || "Afhentningssted ikke valgt"}
        />
        <InfoCard
          icon="chat"
          title={
            patron?.phoneNumber ? "Du får en sms når du kan hente bogen" : "Du får ikke en sms"
          }
          value={patron?.phoneNumber ?? "Der er ikke registreret et telefonnummer."}
        />
        <InfoCard
          icon="envelope"
          title={
            patron?.emailAddress
              ? "Du får en e-mail når du kan hente bogen"
              : "Du får ikke en e-mail"
          }
          value={patron?.emailAddress ?? "Der er ikke registreret en e-mail-adressse."}
        />
        <p className="text-typo-caption text-foreground/70 text-center">
          Vil du ændre afhentningssted eller kontaktinformation, skal du bruge{" "}
          <a href="#" className="animate-text-underline underline">
            voksen-hjemmesiden
          </a>
          .
        </p>
      </div>

      {errorMessage && <p className="text-typo-body-sm text-center text-red-600">{errorMessage}</p>}
    </div>
  )
}

const InfoCard = ({ icon, title, value }: { icon: string; title: string; value: string }) => (
  <div className="bg-background-skeleton/40 rounded-base flex items-center gap-4 px-6 py-4">
    <Icon name={icon} className="text-foreground h-7 w-7 shrink-0" />
    <div className="flex flex-col gap-1">
      <p className="text-typo-subtitle-sm font-medium">{title}</p>
      <p className="text-typo-subtitle-sm text-foreground/70 dark:text-foreground/90">{value}</p>
    </div>
  </div>
)

export default ReservationForm
