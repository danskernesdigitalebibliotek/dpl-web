"use client"

import { differenceInDays } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useState } from "react"

import { expiryStatusText } from "@/components/shared/loanCard/LoanCard"
import {
  type TMaterialCategory,
  getEbookReadUrl,
  getManifestationLabel,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import LoanDetailsContent from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import ModalMaterialList from "@/components/shared/modalMaterialList/ModalMaterialList"
import ModalMaterialListItem from "@/components/shared/modalMaterialList/ModalMaterialListItem"
import {
  ModalViewTransition,
  modalViewVariants,
} from "@/components/shared/modalViewTransition/ModalViewTransition"
import Player from "@/components/shared/publizonPlayer/PublizonPlayer"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import SmartLink from "@/components/shared/smartLink/SmartLink"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { cyKeys } from "@/cypress/support/constants"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import { useModalViewScroll } from "@/hooks/useModalViewScroll"
import {
  ManifestationSearchPageTeaserFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type DigitalLoansModalProps = {
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
}: DigitalLoansModalProps & { open: boolean; onClose: () => void }) => {
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

  // Details open at the top; going back restores the list's position.
  const { anchorRef, scrollToTop, rememberListAndScrollTop, restoreListScroll } =
    useModalViewScroll()

  const goBack = () => {
    setDirection(-1)
    if (playerOpen) {
      setPlayerOpen(false)
      scrollToTop()
    } else {
      setSelectedLoan(null)
      restoreListScroll()
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
      <div ref={anchorRef} />
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
              href={resolveUrl({
                routeParams: { work: "work", wid: selectedLoan.workId },
                queryParams: {
                  type: selectedLoan.manifestation.materialTypes[0].materialTypeSpecific.code,
                },
              })}
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
            <ModalMaterialList dataCy={cyKeys["digital-loans-modal"]}>
              {works.map(work => {
                const manifestation = work.manifestations.all[0]
                const isbn = manifestation.identifiers.find(
                  identifier => identifier.type === "ISBN"
                )?.value
                const loan = loanData.loans?.find(l => l.libraryBook?.identifier === isbn)
                const daysUntil = loan?.loanExpireDateUtc
                  ? differenceInDays(new Date(loan.loanExpireDateUtc), new Date())
                  : null
                const creators = displayCreators(work.creators, 1)
                const title = work.titles.full[0]

                return (
                  <ModalMaterialListItem
                    key={manifestation.pid}
                    manifestation={manifestation}
                    title={title}
                    creators={creators}
                    ariaLabel={`Se detaljer om dit lån af ${title}`}
                    onSelect={() => {
                      const selection = buildSelectedLoan(work, loanData)
                      if (!selection) return
                      rememberListAndScrollTop()
                      setDirection(1)
                      setSelectedLoan(selection)
                    }}
                    status={
                      daysUntil !== null && (
                        <StatusLabel variant={daysUntil <= warning ? "warning" : "neutral"}>
                          {expiryStatusText(daysUntil, danger)}
                        </StatusLabel>
                      )
                    }
                  />
                )
              })}
            </ModalMaterialList>
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
                scrollToTop()
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
