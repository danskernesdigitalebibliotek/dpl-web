import { useLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import PhysicalLoans from "@/app/(pages)/user/profile/PhysicalLoans"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { EBookFactory } from "@/cypress/factories/fbi/factory-parts/works"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

vi.mock("@danskernesdigitalebibliotek/dpl-service-layer", async importOriginal => {
  const actual = await importOriginal<object>()
  return { ...actual, useLoans: vi.fn() }
})
vi.mock("@/lib/graphql/generated/fbi/graphql", async importOriginal => {
  const actual = await importOriginal<object>()
  return { ...actual, useComplexSearchForWorkTeaserQuery: vi.fn() }
})
// Peripheral to what's under test; avoids ServiceLayerProvider, matchMedia,
// ResizeObserver and router dependencies in jsdom.
vi.mock("@/components/shared/loanDetailsModal/LoanDetailsModal", () => ({
  default: () => null,
}))
vi.mock("@/components/shared/coverPicture/CoverPicture", () => ({
  CoverPicture: () => <div />,
  CoverPictureSkeleton: () => <div />,
}))
vi.mock("@/app/(pages)/user/profile/FindBookButton", () => ({
  default: () => null,
}))

// keen-slider needs matchMedia (loanSliderOptions has breakpoints); jsdom has neither.
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  )
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  )
})

const buildLoan = (faust: string) => ({
  loanId: Number(faust),
  recordId: faust,
  dueDate: "2026-08-01",
  loanDate: "2026-07-01",
  materialItemNumber: `50${faust}`,
  isRenewable: false,
})

const buildWork = (faust: string, title: string) => {
  const manifestation = eBookManifestationFactory.build({
    pid: `870970-basis:${faust}`,
    materialTypes: [
      {
        materialTypeGeneral: { display: "bøger", code: "BOOKS" },
        materialTypeSpecific: { code: "BOOK", display: "bog" },
      },
    ],
  })
  return EBookFactory.build({
    workId: `work-of:870970-basis:${faust}`,
    titles: { full: [title] },
    manifestations: { all: [manifestation], bestRepresentation: manifestation },
  })
}

describe("PhysicalLoans loan/work matching", () => {
  // FBS reports three loans, but FBI's complex search only knows two of the
  // FAUSTs — realistic for fjernlån (ILL) and locally catalogued records; the
  // legacy react app explicitly falls back to FBS metadata in this case
  // (react/src/apps/loan-list/materials/utils/material-fetch-hoc.tsx).
  const setup = () => {
    vi.mocked(useLoans).mockReturnValue({
      data: [buildLoan("11111111"), buildLoan("22222222"), buildLoan("33333333")],
      isLoading: false,
    } as ReturnType<typeof useLoans>)

    vi.mocked(useComplexSearchForWorkTeaserQuery).mockReturnValue({
      data: {
        complexSearch: {
          works: [buildWork("11111111", "Bog Et"), buildWork("22222222", "Bog To")],
        },
      },
      isLoading: false,
    } as ReturnType<typeof useComplexSearchForWorkTeaserQuery>)

    return render(<PhysicalLoans />)
  }

  it("counts every FBS loan in the heading, like the digital slider does", () => {
    setup()

    // Regression guard: the heading used to count only FBI-matched items and
    // rendered "(2)" although the patron has 3 loans; the digital LoanSlider
    // shows the true count for the same page.
    expect(
      screen.getByRole("heading", { name: "Bøger jeg har lånt på biblioteket (3)" })
    ).toBeTruthy()
  })

  it("shows every FBS loan, including ones with no FBI match", () => {
    setup()

    expect(screen.getByLabelText(/Tilgå værket Bog Et/)).toBeTruthy()
    expect(screen.getByLabelText(/Tilgå værket Bog To/)).toBeTruthy()
    // Regression guard: loans whose FAUST has no FBI work used to be silently
    // dropped; the third loan now renders as an identifiable fallback card.
    // Every card shows a due status, so the count covers matched + fallback.
    expect(screen.getAllByText(/Skal afleveres/)).toHaveLength(3)
    expect(screen.getByText("Ukendt materiale")).toBeTruthy()
    expect(screen.getByText("Materialenummer 5033333333")).toBeTruthy()
  })
})
