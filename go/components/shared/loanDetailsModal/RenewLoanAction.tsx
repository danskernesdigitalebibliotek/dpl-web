"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import HelpText from "@/components/shared/helpText/HelpText"
import { type LoanDetails } from "@/components/shared/loanDetailsModal/LoanDetailsContent"
import {
  getRenewalFailureMessage,
  hasSpecificRenewalFailureMessage,
} from "@/components/shared/loanDetailsModal/helper"
import { cyKeys } from "@/cypress/support/constants"
import { dueStatus } from "@/lib/helpers/helper.due-status"

type RenewLoanActionProps = {
  loan: LoanDetails
  title: string
  isRenewing: boolean
  onRenew: () => void
}

// "Forlæng lån" with the reason it cannot be used above it, and in its label.
const DisabledRenewAction = ({ title, message }: { title: string; message: string }) => (
  <div className="flex w-full flex-col items-center gap-3">
    <HelpText>{message}</HelpText>
    <Button
      theme="primary"
      size="lg"
      ariaDisabled
      ariaLabel={`Forlæng lån af ${title} — ${message}`}
      data-cy={cyKeys["approve-renew-loan-button"]}>
      Forlæng lån
    </Button>
  </div>
)

// The footer action for a physical loan, shared by the loan modals.
// FBS decides whether renewal is possible right now. A denial with a
// specific reason shows that reason; the generic denial code usually just
// means "outside the renewal window", so it shows a countdown (estimated
// from the configured window) until the window opens, and its copy after.
const RenewLoanAction = ({ loan, title, isRenewing, onRenew }: RenewLoanActionProps) => {
  const { daysUntilRenewable } = dueStatus(loan.dueDate)

  const hasExplainedDenial =
    loan.isRenewable === false &&
    loan.nonRenewableReason !== undefined &&
    hasSpecificRenewalFailureMessage(loan.nonRenewableReason)

  if (hasExplainedDenial) {
    return (
      <DisabledRenewAction
        title={title}
        message={getRenewalFailureMessage(loan.nonRenewableReason ?? "deniedOtherReason")}
      />
    )
  }

  if (loan.isRenewable) {
    return (
      <Button
        theme="primary"
        size="lg"
        isLoading={isRenewing}
        ariaLabel={`Forlæng lån af ${title}`}
        data-cy={cyKeys["approve-renew-loan-button"]}
        onClick={onRenew}>
        Forlæng lån
      </Button>
    )
  }

  if (daysUntilRenewable > 0) {
    return (
      <DisabledRenewAction
        title={title}
        message={`Lånet kan først forlænges om ${daysUntilRenewable} ${
          daysUntilRenewable === 1 ? "dag" : "dage"
        }`}
      />
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
