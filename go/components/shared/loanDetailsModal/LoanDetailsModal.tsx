"use client"

import { type RenewedLoan, useRenewLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useEffect, useState } from "react"

import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { Button } from "@/components/shared/button/Button"
import LoanDetailsContent, {
  type LoanDetails,
} from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import LoanRenewalReceiptContent from "@/components/shared/loanDetailsModal/LoanRenewalReceiptContent"
import PhysicalDueStatusLabel from "@/components/shared/loanDetailsModal/PhysicalDueStatusLabel"
import { getRenewalFailureMessage } from "@/components/shared/loanDetailsModal/helper"
import { ModalViewTransition } from "@/components/shared/modalViewTransition/ModalViewTransition"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { toast } from "@/components/shared/toaster/Toaster"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type LoanDetailsModalProps = {
  loan: LoanDetails
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  // Links the modal title to the material's work page when provided.
  workId?: string
  creators?: string
  // Physical loans are returned ("Afleveres"); digital loans just run out.
  dueDateLabel?: string
}

const LoanDetailsModal = ({
  open,
  onClose,
  loan,
  manifestation,
  title,
  workId,
  creators,
  dueDateLabel = "Afleveres",
}: LoanDetailsModalProps & { open: boolean; onClose: () => void }) => {
  const { mutate: renewLoans, isPending: isRenewing } = useRenewLoans()
  const [renewedLoan, setRenewedLoan] = useState<RenewedLoan | null>(null)

  // The modal stays mounted between openings; start each visit from a clean
  // slate so a previous renewal outcome doesn't leak into the next one.
  useEffect(() => {
    if (open) {
      setRenewedLoan(null)
    }
  }, [open])

  // Receipt is only shown after the user actually renewed in this session;
  // the renewal result carries the new due date.
  const isReceiptStep = renewedLoan !== null

  const canRenew = Boolean(loan.isRenewable) && loan.loanId !== undefined

  const handleRenew = () => {
    if (isRenewing || loan.loanId === undefined) return
    renewLoans([loan.loanId], {
      onSuccess: renewedLoans => {
        const result = renewedLoans.find(r => r.loanId === loan.loanId)
        if (result?.renewed) {
          setRenewedLoan(result)
        } else {
          toast.error(getRenewalFailureMessage(result?.reason ?? "deniedOtherReason"))
        }
      },
      onError: () => {
        // Network / non-JSON — surface via the generic copy bucket.
        toast.error(getRenewalFailureMessage("deniedOtherReason"))
      },
    })
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Dit lån">
      {/* The view transition only slides horizontally, so clip x only; the
          negative margin + padding give cover shadows room at the edges. */}
      <AnimateChangeInHeight className="-mx-6 overflow-x-clip px-6">
        <ModalViewTransition viewKey={isReceiptStep ? "receipt" : "details"}>
          {isReceiptStep && renewedLoan ? (
            <LoanRenewalReceiptContent
              manifestation={manifestation}
              renewedLoan={renewedLoan}
              title={title}
            />
          ) : (
            <LoanDetailsContent
              loan={loan}
              manifestation={manifestation}
              title={title}
              creators={creators}
              dueDateLabel={dueDateLabel}
              href={
                workId
                  ? resolveUrl({
                      routeParams: { work: "work", wid: workId },
                      queryParams: {
                        type: manifestation.materialTypes[0].materialTypeSpecific.code,
                      },
                    })
                  : undefined
              }
              status={<PhysicalDueStatusLabel dueDate={loan.dueDate} />}
            />
          )}
        </ModalViewTransition>
      </AnimateChangeInHeight>

      <ResponsiveDialog.Actions>
        {isReceiptStep ? (
          <Button theme="primary" size="lg" onClick={onClose}>
            OK
          </Button>
        ) : canRenew ? (
          <Button
            theme="primary"
            size="lg"
            isLoading={isRenewing}
            ariaLabel={`Forny lån af ${title}`}
            data-cy={cyKeys["approve-renew-loan-button"]}
            onClick={handleRenew}>
            Forny lån
          </Button>
        ) : (
          <Button theme="primary" size="lg" onClick={onClose}>
            Luk
          </Button>
        )}
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default LoanDetailsModal
