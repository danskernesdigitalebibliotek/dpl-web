import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import PhysicalLoanCard from "@/app/(pages)/user/profile/PhysicalLoanCard"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"

// The modal pulls in useRenewLoans (ServiceLayerProvider) and matchMedia via
// ResponsiveDialog; the cover uses ResizeObserver/framer-motion. Neither is
// under test here — the materialTypes access is.
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
