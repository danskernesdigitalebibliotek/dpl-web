"use client"

import { type RenewedLoan, useRenewLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import LoanDetailsContent from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import LoanRenewalReceiptContent from "@/components/shared/loanDetailsModal/LoanRenewalReceiptContent"
import PhysicalDueStatusLabel from "@/components/shared/loanDetailsModal/PhysicalDueStatusLabel"
import { getRenewalFailureMessage } from "@/components/shared/loanDetailsModal/helper"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import ModalMaterialList from "@/components/shared/modalMaterialList/ModalMaterialList"
import ModalMaterialListItem from "@/components/shared/modalMaterialList/ModalMaterialListItem"
import { type PhysicalLoanItem } from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type PhysicalLoansModalProps = {
  items: PhysicalLoanItem[]
}

// One dialog with three views: loan list, "Dit lån" details with renewal,
// and the renewal receipt.
const PhysicalLoansModal = ({
  open,
  onClose,
  items,
}: PhysicalLoansModalProps & { open: boolean; onClose: () => void }) => {
  const [selected, setSelected] = useState<PhysicalLoanItem | null>(null)
  const [renewedLoan, setRenewedLoan] = useState<RenewedLoan | null>(null)
  const flow = useModalFlow<"list" | "details" | "receipt">({ initial: "list" })

  const { mutate: renewLoans, isPending: isRenewing } = useRenewLoans()

  // Soonest due date first.
  const sortedItems = [...items].sort(
    (a, b) => new Date(a.loan.dueDate).getTime() - new Date(b.loan.dueDate).getTime()
  )

  const goBack = () => {
    setSelected(null)
    flow.back()
  }

  const handleRenew = () => {
    if (!selected || isRenewing) return
    renewLoans([selected.loan.loanId], {
      onSuccess: renewedLoans => {
        const result = renewedLoans.find(r => r.loanId === selected.loan.loanId)
        if (result?.renewed) {
          setRenewedLoan(result)
          flow.goTo("receipt")
        } else {
          toast.error(getRenewalFailureMessage(result?.reason ?? "deniedOtherReason"))
        }
      },
      onError: () => toast.error(getRenewalFailureMessage("deniedOtherReason")),
    })
  }

  const titleText = flow.view === "list" ? `Lån (${items.length})` : "Dit lån"

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      onBack={flow.view === "details" ? goBack : undefined}
      viewDirection={flow.direction}
      title={flow.animatedTitle(titleText)}>
      {flow.renderBody(
        flow.view === "receipt" && selected && renewedLoan ? (
          <LoanRenewalReceiptContent
            manifestation={selected.manifestation}
            renewedLoan={renewedLoan}
            title={selected.work.titles.full[0]}
          />
        ) : flow.view === "details" && selected ? (
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
            status={<PhysicalDueStatusLabel dueDate={selected.loan.dueDate} />}
          />
        ) : (
          <ModalMaterialList dataCy={cyKeys["physical-loans-modal"]}>
            {sortedItems.map(item => {
              const title = item.work.titles.full[0]
              const creators = displayCreators(item.work.creators, 1)
              return (
                <ModalMaterialListItem
                  key={item.loan.loanId}
                  manifestation={item.manifestation}
                  title={title}
                  creators={creators}
                  ariaLabel={`Se detaljer om dit lån af ${title}`}
                  onSelect={() => {
                    setSelected(item)
                    flow.goTo("details")
                  }}
                  status={<PhysicalDueStatusLabel dueDate={item.loan.dueDate} />}
                />
              )
            })}
          </ModalMaterialList>
        )
      )}

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
