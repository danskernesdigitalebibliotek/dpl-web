"use client"

import { type RenewedLoan, useRenewLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { differenceInDays } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import React, { useState } from "react"

import { type PhysicalLoanItem } from "@/app/(pages)/user/profile/PhysicalLoanSlider"
import { dueStatusText } from "@/app/(pages)/user/profile/PhysicalLoanCard"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import LoanDetailsContent from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import LoanRenewalReceiptContent from "@/components/shared/loanDetailsModal/LoanRenewalReceiptContent"
import { getRenewalFailureMessage } from "@/components/shared/loanDetailsModal/helper"
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
import useLoanThresholds from "@/hooks/useLoanThresholds"
import { useModalViewScroll } from "@/hooks/useModalViewScroll"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type PhysicalLoansModalProps = {
  items: PhysicalLoanItem[]
}

// One dialog with internal views: the physical loans list, the "Dit lån"
// details with renewal, and the renewal receipt — modals are never stacked.
const PhysicalLoansModal = ({
  open,
  onClose,
  items,
}: PhysicalLoansModalProps & { open: boolean; onClose: () => void }) => {
  const { warning, danger } = useLoanThresholds()
  const [selected, setSelected] = useState<PhysicalLoanItem | null>(null)
  const [renewedLoan, setRenewedLoan] = useState<RenewedLoan | null>(null)
  const [direction, setDirection] = useState(1)

  // Details open at the top; going back restores the list's position.
  const { anchorRef, rememberListAndScrollTop, restoreListScroll } = useModalViewScroll()

  const { mutate: renewLoans, isPending: isRenewing } = useRenewLoans()

  const goBack = () => {
    setDirection(-1)
    setSelected(null)
    restoreListScroll()
  }

  const handleRenew = () => {
    if (!selected || isRenewing) return
    renewLoans([selected.loan.loanId], {
      onSuccess: renewedLoans => {
        const result = renewedLoans.find(r => r.loanId === selected.loan.loanId)
        if (result?.renewed) {
          setDirection(1)
          setRenewedLoan(result)
        } else {
          toast.error(getRenewalFailureMessage(result?.reason ?? "deniedOtherReason"))
        }
      },
      onError: () => toast.error(getRenewalFailureMessage("deniedOtherReason")),
    })
  }

  const dueStatus = (dueDate: string) => {
    const daysUntil = differenceInDays(new Date(dueDate), new Date())
    const isOverdue = daysUntil < danger
    const isDueSoon = !isOverdue && daysUntil <= warning
    return {
      variant: (isOverdue ? "error" : isDueSoon ? "warning" : "neutral") as
        | "error"
        | "warning"
        | "neutral",
      text: isOverdue ? "Afleveringsfrist overskredet" : dueStatusText(daysUntil),
    }
  }

  const viewKey = renewedLoan ? "receipt" : selected ? "details" : "list"
  const titleText = renewedLoan || selected ? "Dit lån" : `Lån (${items.length})`

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
      onBack={selected && !renewedLoan ? goBack : undefined}
      viewDirection={direction}
      title={animatedTitle}>
      <div ref={anchorRef} />
      {/* The view transition only slides horizontally, so clip x only; the
          negative margin + padding give cover shadows room at the edges. */}
      <AnimateChangeInHeight className="-mx-6 overflow-x-clip px-6">
        <ModalViewTransition viewKey={viewKey} direction={direction}>
          {renewedLoan && selected ? (
            <LoanRenewalReceiptContent
              manifestation={selected.manifestation}
              renewedLoan={renewedLoan}
              title={selected.work.titles.full[0]}
            />
          ) : selected ? (
            <LoanDetailsContent
              loan={selected.loan}
              manifestation={selected.manifestation}
              title={selected.work.titles.full[0]}
              creators={displayCreators(selected.work.creators, 1)}
              href={resolveUrl({
                routeParams: { work: "work", wid: selected.work.workId },
                queryParams: {
                  type: selected.manifestation.materialTypes[0].materialTypeSpecific.code,
                },
              })}
              status={
                <StatusLabel variant={dueStatus(selected.loan.dueDate).variant}>
                  {dueStatus(selected.loan.dueDate).text}
                </StatusLabel>
              }
            />
          ) : (
            <ModalMaterialList dataCy={cyKeys["physical-loans-modal"]}>
              {items.map(item => {
                const title = item.work.titles.full[0]
                const creators = displayCreators(item.work.creators, 1)
                const status = dueStatus(item.loan.dueDate)
                return (
                  <ModalMaterialListItem
                    key={item.loan.loanId}
                    manifestation={item.manifestation}
                    title={title}
                    creators={creators}
                    ariaLabel={`Se detaljer om dit lån af ${title}`}
                    onSelect={() => {
                      rememberListAndScrollTop()
                      setDirection(1)
                      setSelected(item)
                    }}
                    status={<StatusLabel variant={status.variant}>{status.text}</StatusLabel>}
                  />
                )
              })}
            </ModalMaterialList>
          )}
        </ModalViewTransition>
      </AnimateChangeInHeight>

      {selected && (
        <ResponsiveDialog.Actions>
          {renewedLoan ? (
            <Button theme="primary" size="lg" onClick={onClose}>
              OK
            </Button>
          ) : selected.loan.isRenewable ? (
            <Button
              theme="primary"
              size="lg"
              isLoading={isRenewing}
              ariaLabel={`Forny lån af ${selected.work.titles.full[0]}`}
              data-cy={cyKeys["approve-renew-loan-button"]}
              onClick={handleRenew}>
              Forny lån
            </Button>
          ) : null}
        </ResponsiveDialog.Actions>
      )}
    </ResponsiveDialog>
  )
}

export default PhysicalLoansModal
