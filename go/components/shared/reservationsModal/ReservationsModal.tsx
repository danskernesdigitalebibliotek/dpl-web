"use client"

import {
  type Reservation,
  useDeleteReservation,
  useMaterialAvailability,
  usePatron,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import React, { useContext, useState } from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import InfoCard from "@/components/shared/infoCard/InfoCard"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import ModalMaterialHeader from "@/components/shared/modalMaterialHeader/ModalMaterialHeader"
import ModalMaterialList from "@/components/shared/modalMaterialList/ModalMaterialList"
import ModalMaterialListItem from "@/components/shared/modalMaterialList/ModalMaterialListItem"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { useBlacklistedAvailabilityBranches } from "@/hooks/useBlacklistedAvailabilityBranches"
import { useBranchTitle } from "@/hooks/useBranchTitle"
import { adultSiteUrl } from "@/lib/helpers/helper.adult-site"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { type ReservationItem } from "@/lib/helpers/helper.patron"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

const USER_PROFILE_PATH = "/user/me"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type ReservationsModalProps = {
  items: ReservationItem[]
}

const formatDate = (date: string) => format(new Date(date), "d. MMMM yyyy", { locale: da })

const isReadyForPickup = (reservation: Reservation) => reservation.state === "readyForPickup"

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
const ReservationStatus = ({ item }: { item: ReservationItem }) => {
  const { reservation, work } = item
  if (isPickupExpired(reservation)) return <ExpiredPickup />
  if (isReadyForPickup(reservation)) return <PickupInfo reservation={reservation} />
  return <QueueStatus reservation={reservation} workId={work.workId} />
}

const ReservationRow = ({ item, onSelect }: { item: ReservationItem; onSelect: () => void }) => {
  const { work, manifestation } = item
  const title = work.titles.full[0]

  return (
    <ModalMaterialListItem
      manifestation={manifestation}
      title={title}
      creators={displayCreators(work.creators, 1)}
      ariaLabel={`Se detaljer om din reservering af ${title}`}
      onSelect={onSelect}
      status={<ReservationStatus item={item} />}
    />
  )
}

// The "Din reservering" view: pickup place and notification details, with
// the delete action supplied by the parent through the modal footer.
const InfoCardSkeleton = () => (
  <div className="bg-background-skeleton rounded-base h-[76px] w-full animate-pulse" />
)

const ReservationDetails = ({ item }: { item: ReservationItem }) => {
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
            {patron?.phoneNumber && (
              <InfoCard
                icon="chat"
                title="Du får en sms når du kan hente bogen"
                value={patron.phoneNumber}
              />
            )}
            {patron?.emailAddress && (
              <InfoCard
                icon="envelope"
                title="Du får en e-mail når du kan hente bogen"
                value={patron.emailAddress}
              />
            )}
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

// One dialog with three views: reservations list, "Din reservering"
// details, and the deletion receipt.
const ReservationsModal = ({
  open,
  onClose,
  items,
}: ReservationsModalProps & { open: boolean; onClose: () => void }) => {
  const [selected, setSelected] = useState<ReservationItem | null>(null)
  const flow = useModalFlow<"list" | "details" | "receipt">({ initial: "list" })

  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation()

  const ready = items.filter(item => isReadyForPickup(item.reservation))
  const queued = items.filter(item => !isReadyForPickup(item.reservation))

  const goBack = () => {
    setSelected(null)
    flow.back()
  }

  const selectItem = (item: ReservationItem) => {
    setSelected(item)
    flow.goTo("details")
  }

  const handleDelete = () => {
    if (!selected || isDeleting) return
    deleteReservation(selected.reservation.reservationId, {
      onSuccess: () => flow.goTo("receipt"),
      onError: () => toast.error("Reservationen kunne ikke slettes. Prøv igen senere."),
    })
  }

  const titleText =
    flow.view === "receipt"
      ? "Slet reservering"
      : flow.view === "details"
        ? "Din reservering"
        : `Reserveringer (${items.length})`

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      onBack={flow.view === "details" ? goBack : undefined}
      viewDirection={flow.direction}
      title={flow.animatedTitle(titleText)}>
      {flow.renderBody(
        flow.view === "receipt" && selected ? (
          <DeleteReservationReceiptContent cover={selected.manifestation.cover} />
        ) : flow.view === "details" && selected ? (
          <ReservationDetails item={selected} />
        ) : (
          <div data-cy={cyKeys["reservations-modal"]} className="space-y-10">
            {ready.length > 0 && (
              <ModalMaterialList heading={`Klar til afhentning (${ready.length})`}>
                {ready.map(item => (
                  <ReservationRow
                    key={item.reservation.reservationId}
                    item={item}
                    onSelect={() => selectItem(item)}
                  />
                ))}
              </ModalMaterialList>
            )}
            {queued.length > 0 && (
              <ModalMaterialList heading={`I kø (${queued.length})`}>
                {queued.map(item => (
                  <ReservationRow
                    key={item.reservation.reservationId}
                    item={item}
                    onSelect={() => selectItem(item)}
                  />
                ))}
              </ModalMaterialList>
            )}
          </div>
        )
      )}

      {selected && (
        <ResponsiveDialog.Actions>
          {flow.view === "receipt" ? (
            <Button theme="primary" size="lg" onClick={onClose}>
              OK
            </Button>
          ) : (
            <Button
              theme="primary"
              size="lg"
              data-cy={cyKeys["approve-delete-reservation-button"]}
              onClick={handleDelete}
              disabled={isDeleting}
              isLoading={isDeleting}>
              Slet reservering
            </Button>
          )}
        </ResponsiveDialog.Actions>
      )}
    </ResponsiveDialog>
  )
}

export default ReservationsModal
