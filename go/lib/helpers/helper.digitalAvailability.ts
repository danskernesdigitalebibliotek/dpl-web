import { LoanStatusItem } from "@/lib/rest/publizon/adapter/generated/model"

// Publizon answers per identifier. Keyed for lookup by the identifier the
// manifestation carries.
export type TDigitalAvailability = Record<string, LoanStatusItem>

// The statuses that mean the reader can borrow the material: 3 (reserved and
// now redeemable) and 4 (loanable). Everything else - already loaned to
// someone, reserved, in a reservation queue - cannot be borrowed.
//
// An allowlist, mirroring usePublizonReaderPlayerState, which is what drives
// the loan buttons in the FB CMS app. Its `getLoanStatus` reads 5 as
// "reservable", not "unavailable", and GO cannot reserve digital material, so
// 5 is a dead end here for its own reason.
// See docs/go/material-availability.md
const LOANABLE_STATUSES = [3, 4]

export const isDigitalEditionUnavailable = (
  availability: TDigitalAvailability | undefined,
  identifier: string | undefined
): boolean => {
  if (!identifier) return false

  const item = availability?.[identifier]
  if (item?.loanStatus === undefined) return false

  return !LOANABLE_STATUSES.includes(item.loanStatus)
}

export const mapDigitalAvailability = (
  items: LoanStatusItem[] | null | undefined
): TDigitalAvailability => {
  const availability: TDigitalAvailability = {}

  for (const item of items ?? []) {
    if (item.identifier) {
      availability[item.identifier] = item
    }
  }

  return availability
}
