"use client"

import {
  type Reservation,
  useMaterialAvailability,
  usePatron,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import React, { useContext } from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import InfoCard from "@/components/shared/infoCard/InfoCard"
import ModalMaterialHeader from "@/components/shared/modalMaterialHeader/ModalMaterialHeader"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { cyKeys } from "@/cypress/support/constants"
import { useBlacklistedAvailabilityBranches } from "@/hooks/useBlacklistedAvailabilityBranches"
import { useBranchTitle } from "@/hooks/useBranchTitle"
import { adultSiteUrl } from "@/lib/helpers/helper.adult-site"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { type ReservationItem } from "@/lib/helpers/helper.patron"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

const USER_PROFILE_PATH = "/user/me"

const formatDate = (date: string) => format(new Date(date), "d. MMMM yyyy", { locale: da })

export const isReadyForPickup = (reservation: Reservation) => reservation.state === "readyForPickup"

// The pickup window has passed — the reservation must be made again.
const isPickupExpired = (reservation: Reservation) =>
  isReadyForPickup(reservation) &&
  !!reservation.pickupDeadline &&
  new Date(reservation.pickupDeadline).getTime() < Date.now()

// The green pickup box on ready-for-pickup rows: branch and pickup info on
// their own lines, the deadline as the expanded label's bold subline.
const PickupInfo = ({ reservation }: { reservation: Reservation }) => {
  const { data: branchTitle } = useBranchTitle(reservation.pickupBranchId)

  return (
    <StatusLabel
      variant="success"
      subline={
        reservation.pickupDeadline
          ? `Afhent senest ${formatDate(reservation.pickupDeadline)}`
          : undefined
      }>
      {branchTitle && <span>{branchTitle}</span>}
      {reservation.pickupNumber && <span>Afhentningsinfo: {reservation.pickupNumber}</span>}
    </StatusLabel>
  )
}

// Queued: copy count and queue position as plain two-line text (no box).
// FBS numberInQueue is the patron's 1-based position — 1 means next in line.
const QueueStatus = ({ reservation, workId }: { reservation: Reservation; workId: string }) => {
  const blacklistedBranches = useBlacklistedAvailabilityBranches()
  const { data: availability } = useMaterialAvailability(
    workId,
    [reservation.recordId],
    blacklistedBranches
  )

  if (reservation.numberInQueue === undefined) return null

  const aheadInQueue = reservation.numberInQueue - 1

  return (
    <StatusLabel
      variant="neutral"
      className="px-0 py-0"
      subline={
        aheadInQueue === 0 ? "Du er forrest i køen" : `Der er ${aheadInQueue} foran dig i køen`
      }>
      {availability && <span>Biblioteket har {availability.totalCopies} eksemplarer</span>}
    </StatusLabel>
  )
}

// The pickup deadline has passed without collection.
const ExpiredPickup = () => (
  <StatusLabel
    variant="neutral"
    className="bg-background-overlay"
    subline="Afhentningsfristen er overskredet">
    Reserver igen for at låne materialet
  </StatusLabel>
)

// Picks the matching status presentation for a reservation.
export const ReservationStatus = ({ item }: { item: ReservationItem }) => {
  const { reservation, work } = item
  if (isPickupExpired(reservation)) return <ExpiredPickup />
  if (isReadyForPickup(reservation)) return <PickupInfo reservation={reservation} />
  return <QueueStatus reservation={reservation} workId={work.workId} />
}

const InfoCardSkeleton = () => (
  <div className="bg-background-skeleton rounded-base h-[76px] w-full animate-pulse" />
)

// The "Din reservering" view: pickup place and notification details. Shared
// by the profile reservations modal and the work page details modal; the
// delete action is supplied by the parent through the modal footer.
const ReservationDetailsContent = ({ item }: { item: ReservationItem }) => {
  const { reservation, work, manifestation } = item
  const title = work.titles.full[0]
  const creators = displayCreators(work.creators, 1)
  const { data: patron, isLoading: isLoadingPatron } = usePatron()
  const { data: branchTitle, isLoading: isLoadingBranch } = useBranchTitle(
    reservation.pickupBranchId
  )
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const profileUrl = adultSiteUrl(dplCmsConfig?.libraryInfo?.baseURL, USER_PROFILE_PATH) ?? "#"

  return (
    <div data-cy={cyKeys["reservation-details"]} className="space-y-8">
      <ModalMaterialHeader
        cover={manifestation.cover}
        iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
        title={title}
        subtitle={creators ? `Af ${creators}` : null}
        alt={`${title} cover billede`}
        href={resolveUrl({
          routeParams: { work: "work", wid: work.workId },
          queryParams: {
            type: manifestation.materialTypes[0].materialTypeSpecific.code,
          },
        })}
        status={<ReservationStatus item={item} />}
      />

      <hr className="border-foreground/10" />

      {/* Skeletons while patron/branch load, so cards don't pop in one by
          one and shift the layout. */}
      <div className="space-y-4">
        {isLoadingPatron || isLoadingBranch ? (
          <>
            <InfoCardSkeleton />
            <InfoCardSkeleton />
            <InfoCardSkeleton />
          </>
        ) : (
          <>
            {branchTitle && <InfoCard icon="pin" title="Afhentningssted" value={branchTitle} />}
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
          </>
        )}

        <p className="text-typo-caption text-foreground-muted text-center">
          Vil du ændre afhentningssted eller kontaktinformation, skal du bruge{" "}
          <a className="text-foreground underline" href={profileUrl}>
            voksen-hjemmesiden
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default ReservationDetailsContent
