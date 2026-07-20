"use client"

import { differenceInDays, format } from "date-fns"
import { da } from "date-fns/locale"
import React from "react"

import { dueStatusText } from "@/components/shared/physicalLoanCard/PhysicalLoanCard"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import useLoanThresholds from "@/hooks/useLoanThresholds"

// The expanded due status for physical loans in list and material views:
// the relative status with the absolute deadline as bold subline. The
// compact one-line form on the slider cards stays in PhysicalLoanCard.
const PhysicalDueStatusLabel = ({ dueDate }: { dueDate: string }) => {
  const { warning, danger } = useLoanThresholds()
  const daysUntil = differenceInDays(new Date(dueDate), new Date())
  const isOverdue = daysUntil < danger
  const isDueSoon = !isOverdue && daysUntil <= warning

  if (isOverdue) {
    const overdueDays = Math.abs(daysUntil)
    return (
      <StatusLabel
        variant="error"
        subline={`Skulle afleveres ${format(new Date(dueDate), "d. MMM yyyy", { locale: da })}`}>
        {`Afleveringsfristen er overskredet med ${overdueDays} ${
          overdueDays === 1 ? "dag" : "dage"
        }`}
      </StatusLabel>
    )
  }

  if (daysUntil === 0) {
    return (
      <StatusLabel
        variant="warning"
        subline={`Aflevér senest ${format(new Date(dueDate), "d. MMM yyyy", { locale: da })}`}>
        Afleveres i dag
      </StatusLabel>
    )
  }

  return (
    <StatusLabel
      variant={isDueSoon ? "warning" : "neutral"}
      className={isDueSoon ? undefined : "px-0 py-0"}
      subline={`Aflevér senest ${format(new Date(dueDate), "d. MMMM yyyy", { locale: da })}`}>
      {dueStatusText(daysUntil)}
    </StatusLabel>
  )
}

export default PhysicalDueStatusLabel
