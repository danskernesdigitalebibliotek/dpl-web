"use client"

import { useMaterialAvailability, usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
  isPhysicalMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { getFaustIdsFromManifestations } from "@/lib/helpers/ids"

type ReservationModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const ReservationModal = ({ open, onClose, wid, pid }: ReservationModalProps) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = data?.work?.manifestations?.all?.find(m => m.pid === pid)

  const physicalManifestations =
    data?.work?.manifestations?.all.filter(m =>
      isPhysicalMaterialType(m.materialTypes[0]?.materialTypeSpecific.code)
    ) ?? []
  const recordIds = getFaustIdsFromManifestations(physicalManifestations)

  const { data: patron } = usePatron()
  const { data: availability } = useMaterialAvailability(wid, recordIds)

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={(manifestation && `Reservér ${getManifestationLabel(manifestation)}`) || ""}>
      {manifestation && (
        <div data-cy={cyKeys["reservation-modal"]}>
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
                <ReservationRow term="Reservationer">
                  {availability.reservationCount}
                </ReservationRow>
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
          </div>

          <div className="flex flex-row items-center justify-center gap-6">
            <Button
              theme={"primary"}
              size={"lg"}
              data-cy={cyKeys["approve-reservation-button"]}
              disabled>
              Godkend reservation
            </Button>
            <Button size={"lg"} onClick={() => onClose()}>
              Annuller
            </Button>
          </div>
        </div>
      )}
    </ResponsiveDialog>
  )
}

const ReservationRow = ({ term, children }: { term: string; children: React.ReactNode }) => (
  <div className="flex flex-row justify-between gap-4">
    <dt className="text-foreground/70">{term}</dt>
    <dd>{children}</dd>
  </div>
)

export default ReservationModal
