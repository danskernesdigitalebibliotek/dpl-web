import { type Loan, type Reservation } from "@danskernesdigitalebibliotek/dpl-service-layer"

import {
  type TMaterialCategory,
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getManifestationLabel,
  getMaterialCategory,
} from "@/components/pages/workPageLayout/helper"
import {
  GetManifestationsByFaustQuery,
  ManifestationSearchPageTeaserFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { pidToFaust } from "@/lib/helpers/ids"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

// The patron's shelf: pairing FBS/Publizon loans and reservations with their
// FBI works and manifestations. Every consumer (sliders, modals, prefetch)
// must derive sort orders and query variables from here — the variables are
// part of the react-query cache keys, so two copies that drift produce
// silent cache misses.

export type PhysicalLoanItem = {
  loan: Loan
  work: WorkTeaserSearchPageFragment
  manifestation: ManifestationSearchPageTeaserFragment
}

export type ReservationItem = {
  reservation: Reservation
  work: WorkTeaserSearchPageFragment
  manifestation: ManifestationSearchPageTeaserFragment
}

type ManifestationsByFaust = GetManifestationsByFaustQuery["manifestations"] | undefined

// Most urgent first.
export const sortLoansByDueDate = (loans: Loan[]): Loan[] =>
  [...loans].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

// Ready for pickup first, then shortest queue; unknown positions last.
export const sortReservationsByQueue = (reservations: Reservation[]): Reservation[] =>
  [...reservations].sort((a, b) => {
    const aReady = a.state === "readyForPickup"
    const bReady = b.state === "readyForPickup"
    if (aReady !== bReady) return aReady ? -1 : 1
    return (
      (a.numberInQueue ?? Number.MAX_SAFE_INTEGER) - (b.numberInQueue ?? Number.MAX_SAFE_INTEGER)
    )
  })

// Record ids for the one exact FBI lookup covering both loans and
// reservations — the complex search index does not resolve term.faust
// reliably. The order is part of the query identity.
export const shelfRecordIds = (loans: Loan[], reservations: Reservation[]): string[] => [
  ...new Set([
    ...sortLoansByDueDate(loans).map(loan => loan.recordId),
    ...reservations.map(reservation => reservation.recordId),
  ]),
]

// Pair an FBS record with its work + the exact manifestation it points at,
// by matching the record id (FAUST) against the pid. Materials exclusively
// for adults are dropped: GO is the children's site, and the FBS account
// also holds loans/reservations made on the adult site.
export const pairRecordWithMaterial = (
  recordId: string,
  manifestations: ManifestationsByFaust
): {
  work: WorkTeaserSearchPageFragment
  manifestation: ManifestationSearchPageTeaserFragment
} | null => {
  const entry = manifestations?.find(entry => entry && pidToFaust(entry.pid) === recordId)
  if (!entry) return null
  const audienceCodes = entry.audience?.childrenOrAdults.map(({ code }) => code) ?? []
  const isAdultsOnly = audienceCodes.length > 0 && audienceCodes.every(c => c === "FOR_ADULTS")
  if (isAdultsOnly) return null
  const work = entry.ownerWork
  const manifestation = work.manifestations.all.find(
    manifestation => pidToFaust(manifestation.pid) === recordId
  )
  return manifestation ? { work, manifestation } : null
}

// Loans paired with materials, most urgent first.
export const buildPhysicalLoanItems = (
  loans: Loan[],
  manifestations: ManifestationsByFaust
): PhysicalLoanItem[] =>
  sortLoansByDueDate(loans).reduce<PhysicalLoanItem[]>((acc, loan) => {
    const match = pairRecordWithMaterial(loan.recordId, manifestations)
    return match ? [...acc, { loan, ...match }] : acc
  }, [])

// Reservations paired with materials, ready-for-pickup and short queues first.
export const buildReservationItems = (
  reservations: Reservation[],
  manifestations: ManifestationsByFaust
): ReservationItem[] =>
  sortReservationsByQueue(reservations).reduce<ReservationItem[]>((acc, reservation) => {
    const match = pairRecordWithMaterial(reservation.recordId, manifestations)
    return match ? [...acc, { reservation, ...match }] : acc
  }, [])

// --- Digital loans (Publizon) ---

// ISBNs of the patron's digital loans, most urgent first. The order is part
// of the search query identity.
export const digitalLoanIsbns = (loanData: LoanListResult | null | undefined): string[] =>
  [...(loanData?.loans ?? [])]
    .sort(
      (a, b) =>
        new Date(a?.loanExpireDateUtc ?? 8640000000000000).getTime() -
        new Date(b?.loanExpireDateUtc ?? 8640000000000000).getTime()
    )
    .map(loan => loan?.libraryBook?.identifier ?? "")
    .filter(Boolean)

export const isbnSearchCql = (isbns: string[]): string =>
  isbns.map(isbn => `term.isbn=${isbn}`).join(" OR ") || ""

// The Publizon loan behind a paired work. Paired works carry exactly the
// loaned manifestation, so its first ISBN identifies the loan.
export const digitalLoanForWork = (
  work: WorkTeaserSearchPageFragment,
  loanData: LoanListResult
) => {
  const isbn = work.manifestations.all[0].identifiers.find(
    identifier => identifier.type === "ISBN"
  )?.value
  return loanData.loans?.find(loan => loan.libraryBook?.identifier === isbn)
}

// Pair each loan ISBN with its work, narrowed to the loaned manifestation —
// one work per loan, in loan order.
export const pairDigitalLoanWorks = (
  loanData: LoanListResult | null | undefined,
  works: WorkTeaserSearchPageFragment[] | undefined
): WorkTeaserSearchPageFragment[] =>
  digitalLoanIsbns(loanData).reduce<WorkTeaserSearchPageFragment[]>((acc, isbn) => {
    const work = works?.find(work =>
      work.manifestations.all.some(manifestation =>
        manifestation.identifiers.some(identifier => identifier.value === isbn)
      )
    )
    if (!work) return acc
    const allowedManifestations = filterManifestationsByEdition(
      filterManifestationsByMaterialType(filterMaterialTypes(work.manifestations.all))
    )
    const manifestation = allowedManifestations.find(manifestation =>
      manifestation.identifiers.some(identifier => identifier.value === isbn)
    )
    if (!manifestation) return acc
    return [
      ...acc,
      { ...work, manifestations: { all: [manifestation], bestRepresentation: manifestation } },
    ]
  }, [])

// Paired works sorted by their loan's expiry; works without a loan go last.
export const sortWorksBySoonestExpiry = (
  works: WorkTeaserSearchPageFragment[],
  loanData: LoanListResult
): WorkTeaserSearchPageFragment[] => {
  const expiryOf = (work: WorkTeaserSearchPageFragment) => {
    const expiry = digitalLoanForWork(work, loanData)?.loanExpireDateUtc
    return expiry ? new Date(expiry).getTime() : Infinity
  }
  return [...works].sort((a, b) => expiryOf(a) - expiryOf(b))
}

// Everything the "Dit lån" details view needs about one digital loan.
export type SelectedLoan = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  creators: string
  dueDate: string
  loanDate?: string
  orderId?: string
  workId: string
  category: TMaterialCategory
  label: string
}

// Returns null when the loan (or its expiry) is missing.
export const buildSelectedLoan = (
  work: WorkTeaserSearchPageFragment,
  loanData: LoanListResult
): SelectedLoan | null => {
  const manifestation = work.manifestations.all[0]
  const loan = digitalLoanForWork(work, loanData)
  if (!loan?.loanExpireDateUtc) return null
  return {
    manifestation,
    title: work.titles.full[0],
    creators: displayCreators(work.creators, 1),
    dueDate: loan.loanExpireDateUtc,
    loanDate: loan.orderDateUtc ?? undefined,
    orderId: loan.orderId ?? undefined,
    workId: work.workId,
    category: getMaterialCategory(manifestation.materialTypes[0]?.materialTypeSpecific.code),
    label: getManifestationLabel(manifestation),
  }
}
