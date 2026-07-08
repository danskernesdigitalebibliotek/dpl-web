"use client"

import type { Patron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useContext } from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
} from "@/components/pages/workPageLayout/helper"
import InfoCard from "@/components/shared/infoCard/InfoCard"
import ModalMaterialHeader from "@/components/shared/modalMaterialHeader/ModalMaterialHeader"
import { useBranchTitle } from "@/hooks/useBranchTitle"
import type { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

const USER_PROFILE_PATH = "/user/me"

type Work = NonNullable<GetMaterialQuery["work"]>
type Manifestation = NonNullable<Work["manifestations"]["all"]>[number]

type ReservationFormContentProps = {
  work: Work
  manifestation: Manifestation
  patron: Patron | undefined
}

const ReservationFormContent = ({ work, manifestation, patron }: ReservationFormContentProps) => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const baseURL = dplCmsConfig?.libraryInfo?.baseURL
  const adultSiteUrl = baseURL ? `${baseURL.replace(/\/$/, "")}${USER_PROFILE_PATH}` : "#"
  const creators = work?.creators ?? manifestation.contributors ?? []
  const authorLabel = creators.length > 0 ? `Af ${displayCreators(creators, 3)}` : null
  const materialIcon = getManifestationMaterialTypeIcon(manifestation) || "book"
  const manifestationTitle = manifestation.titles?.full?.[0] ?? getManifestationLabel(manifestation)
  const { data: branchTitle, isSuccess: branchLoaded } = useBranchTitle(patron?.pickupBranchId)
  const pickupBranchName = !patron?.pickupBranchId
    ? "Afhentningssted ikke valgt"
    : (branchTitle ?? (branchLoaded ? "Afhentningssted blev ikke fundet" : ""))

  return (
    <div className="mx-auto max-w-prose space-y-8">
      <ModalMaterialHeader
        cover={manifestation.cover}
        iconName={materialIcon}
        title={manifestationTitle}
        subtitle={authorLabel}
      />

      <hr className="border-foreground/10" />

      <div className="space-y-4">
        <InfoCard icon="pin" title="Afhentningssted" value={pickupBranchName} />
        <InfoCard
          icon="chat"
          title={
            patron?.phoneNumber ? "Du får en sms, når du kan hente bogen" : "Du får ikke en sms"
          }
          value={patron?.phoneNumber ?? "Der er ikke registreret et telefonnummer."}
        />
        <InfoCard
          icon="envelope"
          title={
            patron?.emailAddress
              ? "Du får en e-mail, når du kan hente bogen"
              : "Du får ikke en e-mail"
          }
          value={patron?.emailAddress ?? "Der er ikke registreret en e-mail-adresse."}
        />

        <p className="text-typo-caption text-foreground-muted max-w-prose text-center">
          Vil du ændre afhentningssted eller kontaktinformation, skal du bruge{" "}
          <a className="text-foreground underline" href={adultSiteUrl}>
            voksen-hjemmesiden
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default ReservationFormContent
