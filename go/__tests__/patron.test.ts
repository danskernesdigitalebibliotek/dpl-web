import { type Loan, type Reservation } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { describe, expect, it } from "vitest"

import {
  GetManifestationsByFaustQuery,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import {
  buildPhysicalLoanItems,
  buildReservationItems,
  buildSelectedLoan,
  digitalLoanIsbns,
  isbnSearchCql,
  pairDigitalLoanWorks,
  pairRecordWithMaterial,
  shelfRecordIds,
  sortWorksBySoonestExpiry,
} from "@/lib/helpers/helper.patron"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

const loan = (recordId: string, dueDate: string): Loan => ({
  loanId: Number(recordId),
  recordId,
  dueDate,
  loanDate: "2026-01-01",
  materialItemNumber: "",
  isRenewable: false,
  nonRenewableReason: "deniedOtherReason",
})

const reservation = (recordId: string, overrides: Partial<Reservation> = {}): Reservation => ({
  reservationId: Number(recordId),
  recordId,
  pickupBranchId: "DK-761500",
  numberInQueue: 1,
  state: "reserved",
  pickupDeadline: undefined,
  pickupNumber: undefined,
  ...overrides,
})

// A GetManifestationsByFaust entry: a work owning one manifestation per faust.
const entry = (faust: string, { adultsOnly = false } = {}) => ({
  pid: `870970-basis:${faust}`,
  audience: {
    childrenOrAdults: [{ code: adultsOnly ? "FOR_ADULTS" : "FOR_CHILDREN", display: "" }],
  },
  ownerWork: {
    workId: `work-of:870970-basis:${faust}`,
    titles: { full: [`Værk ${faust}`] },
    creators: [],
    manifestations: {
      all: [{ pid: `870970-basis:${faust}` }],
      bestRepresentation: { pid: `870970-basis:${faust}` },
    },
  },
})

const manifestations = (
  ...entries: ReturnType<typeof entry>[]
): GetManifestationsByFaustQuery["manifestations"] =>
  entries as unknown as GetManifestationsByFaustQuery["manifestations"]

describe("physical shelf", () => {
  it("shelfRecordIds puts loans first (most urgent leading), then reservations, deduped", () => {
    const loans = [loan("2", "2026-02-01"), loan("1", "2026-01-01")]
    const reservations = [reservation("3"), reservation("1")]
    expect(shelfRecordIds(loans, reservations)).toEqual(["1", "2", "3"])
  })

  it("pairRecordWithMaterial pairs by faust and drops adults-only materials", () => {
    const data = manifestations(entry("1"), entry("2", { adultsOnly: true }))
    expect(pairRecordWithMaterial("1", data)?.work.workId).toBe("work-of:870970-basis:1")
    expect(pairRecordWithMaterial("2", data)).toBeNull()
    expect(pairRecordWithMaterial("9", data)).toBeNull()
  })

  it("buildPhysicalLoanItems sorts most urgent first and skips unmatched records", () => {
    const loans = [loan("2", "2026-02-01"), loan("1", "2026-01-01"), loan("9", "2026-01-15")]
    const items = buildPhysicalLoanItems(loans, manifestations(entry("1"), entry("2")))
    expect(items.map(item => item.loan.recordId)).toEqual(["1", "2"])
  })

  it("buildReservationItems puts ready-for-pickup first, then shortest queue", () => {
    const reservations = [
      reservation("1", { numberInQueue: 5 }),
      reservation("2", { state: "readyForPickup", numberInQueue: undefined }),
      reservation("3", { numberInQueue: 2 }),
    ]
    const items = buildReservationItems(
      reservations,
      manifestations(entry("1"), entry("2"), entry("3"))
    )
    expect(items.map(item => item.reservation.recordId)).toEqual(["2", "3", "1"])
  })
})

// A searchable work: one e-book manifestation carrying the ISBN.
const digitalWork = (faust: string, isbn: string) =>
  ({
    workId: `work-of:870970-basis:${faust}`,
    titles: { full: [`Værk ${faust}`] },
    creators: [],
    manifestations: {
      all: [
        {
          pid: `870970-basis:${faust}`,
          identifiers: [{ type: "ISBN", value: isbn }],
          materialTypes: [
            {
              materialTypeGeneral: { display: "e-bøger", code: "EBOOKS" },
              materialTypeSpecific: { code: "EBOOK", display: "e-bog" },
            },
          ],
        },
      ],
    },
  }) as unknown as WorkTeaserSearchPageFragment

const digitalLoanData: LoanListResult = {
  loans: [
    {
      orderId: "order-b",
      orderDateUtc: "2026-01-01",
      loanExpireDateUtc: "2026-02-01",
      libraryBook: { identifier: "isbn-b" },
    },
    {
      orderId: "order-a",
      orderDateUtc: "2026-01-01",
      loanExpireDateUtc: "2026-01-10",
      libraryBook: { identifier: "isbn-a" },
    },
  ],
}

describe("digital shelf", () => {
  it("digitalLoanIsbns lists soonest-expiring first", () => {
    expect(digitalLoanIsbns(digitalLoanData)).toEqual(["isbn-a", "isbn-b"])
  })

  it("isbnSearchCql builds an OR query and falls back to an empty string", () => {
    expect(isbnSearchCql(["a", "b"])).toBe("term.isbn=a OR term.isbn=b")
    expect(isbnSearchCql([])).toBe("")
  })

  it("pairDigitalLoanWorks returns one work per loan in loan order", () => {
    const works = [digitalWork("2", "isbn-b"), digitalWork("1", "isbn-a")]
    const paired = pairDigitalLoanWorks(digitalLoanData, works)
    expect(paired.map(work => work.workId)).toEqual([
      "work-of:870970-basis:1",
      "work-of:870970-basis:2",
    ])
    expect(paired[0].manifestations.all).toHaveLength(1)
  })

  it("sortWorksBySoonestExpiry orders paired works by their loan's expiry", () => {
    const works = [digitalWork("2", "isbn-b"), digitalWork("1", "isbn-a")]
    const sorted = sortWorksBySoonestExpiry(works, digitalLoanData)
    expect(sorted.map(work => work.workId)).toEqual([
      "work-of:870970-basis:1",
      "work-of:870970-basis:2",
    ])
  })

  it("buildSelectedLoan derives the details view data and rejects loans without expiry", () => {
    const selected = buildSelectedLoan(digitalWork("1", "isbn-a"), digitalLoanData)
    expect(selected).toMatchObject({
      workId: "work-of:870970-basis:1",
      dueDate: "2026-01-10",
      orderId: "order-a",
      category: "ebook",
    })
    expect(buildSelectedLoan(digitalWork("9", "isbn-none"), digitalLoanData)).toBeNull()
  })
})
