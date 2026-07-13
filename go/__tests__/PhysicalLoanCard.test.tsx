import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import PhysicalLoanCard from "@/app/(pages)/user/profile/PhysicalLoanCard"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"

// The modal pulls in useRenewLoans (ServiceLayerProvider) and matchMedia via
// ResponsiveDialog; the cover uses ResizeObserver/framer-motion. Neither is
// under test here — the due-date logic and the materialTypes access are.
vi.mock("@/components/shared/loanDetailsModal/LoanDetailsModal", () => ({
  default: () => null,
}))
vi.mock("@/components/shared/coverPicture/CoverPicture", () => ({
  CoverPicture: () => <div />,
  CoverPictureSkeleton: () => <div />,
}))

const manifestation = eBookManifestationFactory.build({
  pid: "870970-basis:12345671",
  materialTypes: [
    {
      materialTypeGeneral: { display: "bøger", code: "BOOKS" },
      materialTypeSpecific: { code: "BOOK", display: "bog" },
    },
  ],
})

const buildLoan = (dueDate: string) => ({
  loanId: 42,
  recordId: "12345671",
  dueDate,
  loanDate: "2026-06-15",
  materialItemNumber: "5001234567",
  isRenewable: true,
})

const renderCard = (dueDate: string, overrides?: { materialTypes: [] }) =>
  render(
    <PhysicalLoanCard
      loan={buildLoan(dueDate)}
      manifestation={{ ...manifestation, ...overrides }}
      title="Sjælerytterne"
      workId="work-of:870970-basis:12345671"
    />
  )

describe("PhysicalLoanCard due-date status", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // FBS delivers dueDate as a date-only string (see loans.mapper.test.ts and
  // the legacy app's FBS fixtures), meaning "the material may be returned all
  // of that day". new Date("2026-07-16") parses as UTC midnight, and
  // differenceInDays truncates elapsed 24h periods — so a loan due TOMORROW
  // already reads as 0 days for most of today.
  it("shows 'om 1 dag' for a loan due tomorrow (date-only FBS dueDate)", () => {
    // 2026-07-15 10:00 in Copenhagen (08:00 UTC); due date is the 16th.
    vi.setSystemTime(new Date("2026-07-15T08:00:00Z"))

    renderCard("2026-07-16")

    // Regression guard: differenceInDays(2026-07-16T00:00Z, now) truncates to
    // 0 and showed the red "Skal afleveres nu" state a full day early;
    // daysUntilDue uses calendar-day difference on a locally-parsed date.
    expect(screen.getByText("Skal afleveres om 1 dag")).toBeTruthy()
    expect(screen.queryByText("Skal afleveres nu")).toBeNull()
  })

  it("shows 'Skal afleveres nu' on the due date itself (control)", () => {
    vi.setSystemTime(new Date("2026-07-16T08:00:00Z"))

    renderCard("2026-07-16")

    expect(screen.getByText("Skal afleveres nu")).toBeTruthy()
  })
})

describe("PhysicalLoanCard materialTypes access", () => {
  // materialTypes[0].materialTypeSpecific.code (line 58) and the icon helper's
  // materialTypes?.[0].materialTypeSpecific dereference index 0 unguarded.
  // The GraphQL type is Array<MaterialType> — non-nullable but emptiable.
  // The sibling LoanCard uses materialTypes[0]?. for the same fragment.
  it("renders without crashing when a manifestation has no materialTypes", () => {
    // Regression guard: an unguarded materialTypes[0] threw a TypeError here,
    // and with no error boundary under go/app that took down the profile page.
    expect(() => renderCard("2026-08-01", { materialTypes: [] })).not.toThrow()
  })
})
