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

  return (
    <StatusLabel
      variant={isOverdue ? "error" : isDueSoon ? "warning" : "neutral"}
      className={isOverdue || isDueSoon ? undefined : "px-0 py-0"}
      subline={`Aflevér senest ${format(new Date(dueDate), "d. MMMM yyyy", { locale: da })}`}>
      {isOverdue ? "Afleveringsfrist overskredet" : dueStatusText(daysUntil)}
    </StatusLabel>
  )
}

export default PhysicalDueStatusLabel
