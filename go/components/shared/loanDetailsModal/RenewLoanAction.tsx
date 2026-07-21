"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import { type LoanDetails } from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import { getRenewalFailureMessage } from "@/components/shared/loanDetailsModal/helper"
import { cyKeys } from "@/cypress/support/constants"
import useDueStatus from "@/hooks/useDueStatus"

type RenewLoanActionProps = {
  loan: LoanDetails
  title: string
  isRenewing: boolean
  onRenew: () => void
}

// Disabled "Forny lån" with an explanation above it — same shape as the
// availability note in the reservation modal.
const DisabledRenewAction = ({ title, message }: { title: string; message: string }) => (
  <div className="flex w-full flex-col items-center gap-3">
    <p className="text-typo-caption text-foreground-muted text-center">{message}</p>
    <Button
      theme="primary"
      size="lg"
      disabled
      ariaLabel={`Forny lån af ${title}`}
      data-cy={cyKeys["approve-renew-loan-button"]}>
      Forny lån
    </Button>
  </div>
)

// The footer action for a physical loan, shared by the loan modals.
// Cicero only allows renewing a loan from `renewalWindow` days before the
// due date, so before that the button is disabled with a countdown; inside
// the window it renews, or explains FBS' denial reason when blocked.
const RenewLoanAction = ({ loan, title, isRenewing, onRenew }: RenewLoanActionProps) => {
  const { daysUntilRenewable } = useDueStatus()(loan.dueDate)

  if (daysUntilRenewable > 0) {
    return (
      <DisabledRenewAction
        title={title}
        message={`Lånet kan først fornys om ${daysUntilRenewable} ${
          daysUntilRenewable === 1 ? "dag" : "dage"
        }`}
      />
    )
  }

  if (loan.isRenewable) {
    return (
      <Button
        theme="primary"
        size="lg"
        isLoading={isRenewing}
        ariaLabel={`Forny lån af ${title}`}
        data-cy={cyKeys["approve-renew-loan-button"]}
        onClick={onRenew}>
        Forny lån
      </Button>
    )
  }

  return (
    <DisabledRenewAction
      title={title}
      message={getRenewalFailureMessage(loan.nonRenewableReason ?? "deniedOtherReason")}
    />
  )
}

export default RenewLoanAction
