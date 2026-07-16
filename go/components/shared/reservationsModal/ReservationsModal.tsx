"use client"

import {
  type Reservation,
  useDeleteReservation,
  useMaterialAvailability,
  usePatron,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import { AnimatePresence, motion } from "framer-motion"
import React, { useContext, useState } from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import DeleteReservationReceiptContent from "@/components/shared/deleteReservationModal/DeleteReservationReceiptContent"
import InfoCard from "@/components/shared/infoCard/InfoCard"
import ModalMaterialHeader from "@/components/shared/modalMaterialHeader/ModalMaterialHeader"
import ModalMaterialList from "@/components/shared/modalMaterialList/ModalMaterialList"
import ModalMaterialListItem from "@/components/shared/modalMaterialList/ModalMaterialListItem"
import {
  ModalViewTransition,
  modalViewVariants,
} from "@/components/shared/modalViewTransition/ModalViewTransition"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { useBranchTitle } from "@/hooks/useBranchTitle"
import { useModalViewScroll } from "@/hooks/useModalViewScroll"
import {
  ManifestationSearchPageTeaserFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

const USER_PROFILE_PATH = "/user/me"

export type ReservationItem = {
  reservation: Reservation
  work: WorkTeaserSearchPageFragment
  manifestation: ManifestationSearchPageTeaserFragment
}

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
export const PickupInfo = ({ reservation }: { reservation: Reservation }) => {
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
export const QueueStatus = ({
  reservation,
  workId,
}: {
  reservation: Reservation
  workId: string
}) => {
  const { data: availability } = useMaterialAvailability(workId, [reservation.recordId])

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
export const ExpiredPickup = () => (
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
  const baseURL = dplCmsConfig?.libraryInfo?.baseURL
  const adultSiteUrl = baseURL ? `${baseURL.replace(/\/$/, "")}${USER_PROFILE_PATH}` : "#"

  return (
    <div data-cy={cyKeys["reservation-details"]} className="mx-auto max-w-prose space-y-8">
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

// One dialog with internal views: the reservations list, the "Din
// reservering" details, and the deletion receipt — modals are never stacked.
const ReservationsModal = ({
  open,
  onClose,
  items,
}: ReservationsModalProps & { open: boolean; onClose: () => void }) => {
  const [selected, setSelected] = useState<ReservationItem | null>(null)
  const [deletionSucceeded, setDeletionSucceeded] = useState(false)
  const [direction, setDirection] = useState(1)

  // Details open at the top; going back restores the list's position.
  const { anchorRef, rememberListAndScrollTop, restoreListScroll } = useModalViewScroll()

  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation()

  const ready = items.filter(item => isReadyForPickup(item.reservation))
  const queued = items.filter(item => !isReadyForPickup(item.reservation))

  const goBack = () => {
    setDirection(-1)
    setSelected(null)
    restoreListScroll()
  }

  const handleDelete = () => {
    if (!selected || isDeleting) return
    deleteReservation(selected.reservation.reservationId, {
      onSuccess: () => {
        setDirection(1)
        setDeletionSucceeded(true)
      },
      onError: () => toast.error("Reservationen kunne ikke slettes. Prøv igen senere."),
    })
  }

  const viewKey = deletionSucceeded ? "receipt" : selected ? "details" : "list"
  const titleText = deletionSucceeded
    ? "Slet reservering"
    : selected
      ? "Din reservering"
      : `Reserveringer (${items.length})`

  // The title participates in the same directional transition as the body.
  const animatedTitle = (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.span
        key={viewKey}
        className="block"
        custom={direction}
        variants={modalViewVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.2, ease: "easeOut" }}>
        {titleText}
      </motion.span>
    </AnimatePresence>
  )

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      onBack={selected && !deletionSucceeded ? goBack : undefined}
      viewDirection={direction}
      title={animatedTitle}>
      <div ref={anchorRef} />
      {/* The view transition only slides horizontally, so clip x only; the
          negative margin + padding give cover shadows room at the edges. */}
      <AnimateChangeInHeight className="-mx-6 overflow-x-clip px-6">
        <ModalViewTransition viewKey={viewKey} direction={direction}>
          {deletionSucceeded && selected ? (
            <DeleteReservationReceiptContent cover={selected.manifestation.cover} />
          ) : selected ? (
            <ReservationDetails item={selected} />
          ) : (
            <div data-cy={cyKeys["reservations-modal"]} className="mx-auto max-w-prose space-y-10">
              {ready.length > 0 && (
                <ModalMaterialList heading={`Klar til afhentning (${ready.length})`}>
                  {ready.map(item => (
                    <ReservationRow
                      key={item.reservation.reservationId}
                      item={item}
                      onSelect={() => {
                        rememberListAndScrollTop()
                        setDirection(1)
                        setSelected(item)
                      }}
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
                      onSelect={() => {
                        rememberListAndScrollTop()
                        setDirection(1)
                        setSelected(item)
                      }}
                    />
                  ))}
                </ModalMaterialList>
              )}
            </div>
          )}
        </ModalViewTransition>
      </AnimateChangeInHeight>

      {selected && (
        <ResponsiveDialog.Actions>
          {deletionSucceeded ? (
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
