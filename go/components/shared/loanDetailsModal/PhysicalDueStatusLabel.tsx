"use client"

import { format } from "date-fns"
import { da } from "date-fns/locale"
import React from "react"

import { dueStatusText } from "@/components/shared/physicalLoanCard/PhysicalLoanCard"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import useDueStatus from "@/hooks/useDueStatus"

// The expanded due status for physical loans in list and material views:
// the relative status with the absolute deadline as bold subline. The
// compact one-line form on the slider cards stays in PhysicalLoanCard.
const PhysicalDueStatusLabel = ({ dueDate }: { dueDate: string }) => {
  const { state, daysUntil } = useDueStatus()(dueDate)

  if (state === "overdue") {
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

  if (state === "due-today") {
    return (
      <StatusLabel
        variant="warning"
        subline={`Aflevér senest ${format(new Date(dueDate), "d. MMM yyyy", { locale: da })}`}>
        Skal afleveres i dag
      </StatusLabel>
    )
  }

  return (
    <StatusLabel
      variant={state === "due-soon" ? "warning" : "neutral"}
      className={state === "due-soon" ? undefined : "px-0 py-0"}
      subline={`Aflevér senest ${format(new Date(dueDate), "d. MMMM yyyy", { locale: da })}`}>
      {dueStatusText(daysUntil)}
    </StatusLabel>
  )
}

export default PhysicalDueStatusLabel
