"use client"

import React from "react"

import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { type DueStatus, dueStatus } from "@/lib/helpers/helper.due-status"

// Digital loans just run out — no overdue (red) state; at or past the due
// date reads "Udløber i dag" as a warning.
export const expiryStatusText = ({ state, daysUntil }: DueStatus) => {
  if (state === "overdue" || state === "due-today") {
    return "Udløber i dag"
  }
  return `Udløber om ${daysUntil} ${daysUntil === 1 ? "dag" : "dage"}`
}

// Compact expiry status for digital loans. Renders nothing without a due date.
const DigitalExpiryStatusLabel = ({ dueDate }: { dueDate: string | null | undefined }) => {
  if (!dueDate) return null

  const status = dueStatus(dueDate)
  return (
    <StatusLabel variant={status.state === "neutral" ? "neutral" : "warning"}>
      {expiryStatusText(status)}
    </StatusLabel>
  )
}

export default DigitalExpiryStatusLabel
