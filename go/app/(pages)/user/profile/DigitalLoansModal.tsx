"use client"

import { differenceInDays } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useState } from "react"

import { expiryStatusText } from "@/app/(pages)/user/profile/LoanCard"
import {
  type TMaterialCategory,
  getEbookReadUrl,
  getManifestationLabel,
  getManifestationMaterialTypeIcon,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import LoanDetailsContent from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import {
  ModalViewTransition,
  modalViewVariants,
} from "@/components/shared/modalViewTransition/ModalViewTransition"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import {
  ManifestationSearchPageTeaserFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

type DigitalLoansModalProps = {
  open: boolean
  onClose: () => void
  works: WorkTeaserSearchPageFragment[]
  loanData: LoanListResult
  // Opens directly on this loan's details (e.g. from a slider card);
  // the back button still leads to the list.
  initialLoan?: SelectedLoan | null
}

export type SelectedLoan = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  creators: string
  dueDate: string
  loanDate?: string
  orderId?: string
  workId: string
  category: TMaterialCategory
  label: string
}

// Pairs a work with its Publizon loan and derives everything the details
// view needs. Returns null when the loan (or its expiry) is missing.
export const buildSelectedLoan = (
  work: WorkTeaserSearchPageFragment,
  loanData: LoanListResult
): SelectedLoan | null => {
  const manifestation = work.manifestations.all[0]
  const isbn = manifestation.identifiers.find(identifier => identifier.type === "ISBN")?.value
  const loan = loanData.loans?.find(l => l.libraryBook?.identifier === isbn)
  if (!loan?.loanExpireDateUtc) return null
  return {
    manifestation,
    title: work.titles.full[0],
    creators: displayCreators(work.creators, 1),
    dueDate: loan.loanExpireDateUtc,
    loanDate: loan.orderDateUtc ?? undefined,
    orderId: loan.orderId ?? undefined,
    workId: work.workId,
    category: getMaterialCategory(manifestation.materialTypes[0]?.materialTypeSpecific.code),
    label: getManifestationLabel(manifestation),
  }
}

// One dialog with two views: the loan list, and the "Dit lån" details for a
// selected loan. The header's back button returns to the list — modals are
// never stacked on top of each other.
const DigitalLoansModal = ({
  open,
  onClose,
  works,
  loanData,
  initialLoan,
}: DigitalLoansModalProps) => {
  const { warning, danger } = useLoanThresholds()
  const [selectedLoan, setSelectedLoan] = useState<SelectedLoan | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [direction, setDirection] = useState(1)

  // Start from the list — or the requested loan — whenever the modal opens.
  useEffect(() => {
    if (open) {
      setSelectedLoan(initialLoan ?? null)
      setPlayerOpen(false)
      setDirection(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const goBack = () => {
    setDirection(-1)
    if (playerOpen) {
      setPlayerOpen(false)
    } else {
      setSelectedLoan(null)
    }
  }

  // Opened directly on a loan (from a slider card) the list was never shown,
  // so the details view has nothing to go back to. The player view can always
  // step back to the details.
  const openedOnLoan = Boolean(initialLoan)
  const canGoBack = playerOpen || (selectedLoan !== null && !openedOnLoan)

  const viewKey = playerOpen ? "player" : selectedLoan ? "detail" : "list"
  const titleText = playerOpen
    ? `Lyt til ${selectedLoan?.label ?? ""}`
    : selectedLoan
      ? "Dit lån"
      : `Digitale lån (${loanData.loans?.length ?? 0})`

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
      onBack={canGoBack ? goBack : undefined}
      viewDirection={direction}
      title={animatedTitle}>
      {/* The view transition only slides horizontally, so clip x only; the
          negative margin + padding give cover shadows room at the edges. */}
      <AnimateChangeInHeight className="-mx-6 overflow-x-clip px-6">
        <ModalViewTransition viewKey={viewKey} direction={direction}>
          {playerOpen && selectedLoan?.orderId ? (
            <div className="mx-auto max-w-prose">
              <Player type="loan" orderId={selectedLoan.orderId} />
            </div>
          ) : selectedLoan ? (
            <LoanDetailsContent
              loan={{ dueDate: selectedLoan.dueDate, loanDate: selectedLoan.loanDate }}
              manifestation={selectedLoan.manifestation}
              title={selectedLoan.title}
              creators={selectedLoan.creators}
              dueDateLabel="Udløber"
              status={(() => {
                const daysUntil = differenceInDays(new Date(selectedLoan.dueDate), new Date())
                return (
                  <StatusLabel variant={daysUntil <= warning ? "warning" : "neutral"}>
                    {expiryStatusText(daysUntil, danger)}
                  </StatusLabel>
                )
              })()}
            />
          ) : (
            <ul
              data-cy={cyKeys["digital-loans-modal"]}
              className="divide-foreground/10 mx-auto max-w-prose divide-y">
              {works.map(work => {
                const manifestation = work.manifestations.all[0]
                const isbn = manifestation.identifiers.find(
                  identifier => identifier.type === "ISBN"
                )?.value
                const loan = loanData.loans?.find(l => l.libraryBook?.identifier === isbn)
                const daysUntil = loan?.loanExpireDateUtc
                  ? differenceInDays(new Date(loan.loanExpireDateUtc), new Date())
                  : null
                const { width: coverWidth, height: coverHeight } = manifestation.cover.large ?? {}
                const coverAspectRatio =
                  coverWidth && coverHeight ? `${coverWidth} / ${coverHeight}` : "10 / 17"
                const creators = displayCreators(work.creators, 1)
                const title = work.titles.full[0]

                return (
                  <li key={manifestation.pid} className="py-8 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      aria-label={`Se detaljer om dit lån af ${title}`}
                      onClick={() => {
                        const selection = buildSelectedLoan(work, loanData)
                        if (!selection) return
                        setDirection(1)
                        setSelectedLoan(selection)
                      }}
                      className="focus-visible flex w-full cursor-pointer items-end gap-8 text-left">
                      <div className="w-28 shrink-0 lg:w-32">
                        <div className="relative w-full" style={{ aspectRatio: coverAspectRatio }}>
                          <CoverPicture
                            covers={manifestation.cover}
                            alt={`${title} cover billede`}
                            withTilt={false}
                            className="select-none"
                            badge={
                              <MaterialTypeIconWrapper
                                iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
                                className="bg-background-overlay-solid outline-1"
                              />
                            }
                          />
                        </div>
                      </div>
                      <div className="min-w-0 space-y-2">
                        <p className="text-typo-heading-5">{title}</p>
                        {creators && (
                          <p className="text-typo-subtitle-sm text-foreground-muted">
                            Af {creators}
                          </p>
                        )}
                        {daysUntil !== null && (
                          <StatusLabel variant={daysUntil <= warning ? "warning" : "neutral"}>
                            {expiryStatusText(daysUntil, danger)}
                          </StatusLabel>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ModalViewTransition>
      </AnimateChangeInHeight>

      {selectedLoan && !playerOpen && selectedLoan.orderId && (
        <ResponsiveDialog.Actions>
          {selectedLoan.category === "ebook" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Læs ${selectedLoan.label}`}
              data-cy={cyKeys["read-loan-button"]}
              asChild>
              <SmartLink href={getEbookReadUrl(selectedLoan.workId, selectedLoan.orderId)} reload>
                Læs {selectedLoan.label}
              </SmartLink>
            </Button>
          ) : selectedLoan.category === "audio" ? (
            <Button
              theme="primary"
              size="lg"
              ariaLabel={`Lyt til ${selectedLoan.label}`}
              data-cy={cyKeys["listen-loan-button"]}
              onClick={() => {
                setDirection(1)
                setPlayerOpen(true)
              }}>
              Lyt til {selectedLoan.label}
            </Button>
          ) : null}
        </ResponsiveDialog.Actions>
      )}
    </ResponsiveDialog>
  )
}

export default DigitalLoansModal
