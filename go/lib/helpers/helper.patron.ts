import {
  type DigitalLoan,
  type Loan,
  type Reservation,
} from "@danskernesdigitalebibliotek/dpl-service-layer"

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

// --- Digital loans (Publizon + Biblio) ---
//
// Two providers coexist while the Biblio adapter is being rolled out: new
// loans are made through Biblio, but existing Publizon loans stay visible
// until they expire. Both identify materials the same way (ISBN/identifier),
// so pairing with FBI works is shared; which provider a loan came from only
// matters when opening it — orderId opens pubhub's reader/player, loanId the
// WeDoBooks one.
//
// TODO(publizon-sunset): when the Publizon API is phased out, drop the
// LoanListResult parameters and the Publizon halves below — the biblio
// arguments become the only source: digitalLoanIsbns, pairDigitalLoanWorks,
// sortWorksBySoonestExpiry, buildSelectedLoan (incl. SelectedLoan.orderId),
// findPublizonLoan and digitalLoanForWork go entirely.

// ISBNs of the patron's digital loans across both providers, most urgent
// first. The order is part of the search query identity.
export const digitalLoanIsbns = (
  loanData: LoanListResult | null | undefined,
  biblioLoans?: DigitalLoan[]
): string[] => {
  const publizon = (loanData?.loans ?? []).map(loan => ({
    identifier: loan?.libraryBook?.identifier ?? "",
    expiry: loan?.loanExpireDateUtc ?? null,
  }))
  const biblio = (biblioLoans ?? []).map(loan => ({
    identifier: loan.materialId,
    expiry: loan.endDate,
  }))

  return [...publizon, ...biblio]
    .sort(
      (a, b) =>
        new Date(a.expiry ?? 8640000000000000).getTime() -
        new Date(b.expiry ?? 8640000000000000).getTime()
    )
    .map(({ identifier }) => identifier)
    .filter(Boolean)
}

export const isbnSearchCql = (isbns: string[]): string =>
  isbns.map(isbn => `term.isbn=${isbn}`).join(" OR ") || ""

// The patron's Publizon loan on a material, matched on the identifier the
// loan was created with. The single definition of "is this on loan" — the
// work page buttons and the loan modal must never disagree on it.
export const findPublizonLoan = (
  loanData: LoanListResult | null | undefined,
  identifier: string | null | undefined
) =>
  identifier
    ? loanData?.loans?.find(loan => loan.libraryBook?.identifier === identifier)
    : undefined

// The Biblio counterpart of findPublizonLoan.
export const findBiblioLoan = (
  loans: DigitalLoan[] | undefined,
  identifier: string | null | undefined
): DigitalLoan | undefined =>
  identifier ? loans?.find(loan => loan.materialId === identifier) : undefined

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

// The Biblio loan behind a paired work. Matched on any identifier rather
// than ISBN only: the adapter's material id is the identifier the loan was
// made with, which is not always typed ISBN in the catalogue.
export const biblioLoanForWork = (
  work: WorkTeaserSearchPageFragment,
  biblioLoans: DigitalLoan[] | undefined
): DigitalLoan | undefined =>
  biblioLoans?.find(loan =>
    work.manifestations.all[0].identifiers.some(identifier => identifier.value === loan.materialId)
  )

// Pair each loan ISBN with its work, narrowed to the loaned manifestation —
// one work per loan, in loan order.
export const pairDigitalLoanWorks = (
  loanData: LoanListResult | null | undefined,
  works: WorkTeaserSearchPageFragment[] | undefined,
  biblioLoans?: DigitalLoan[]
): WorkTeaserSearchPageFragment[] =>
  digitalLoanIsbns(loanData, biblioLoans).reduce<WorkTeaserSearchPageFragment[]>((acc, isbn) => {
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
  loanData: LoanListResult,
  biblioLoans?: DigitalLoan[]
): WorkTeaserSearchPageFragment[] => {
  const expiryOf = (work: WorkTeaserSearchPageFragment) => {
    const expiry =
      digitalLoanForWork(work, loanData)?.loanExpireDateUtc ??
      biblioLoanForWork(work, biblioLoans)?.endDate
    return expiry ? new Date(expiry).getTime() : Infinity
  }
  return [...works].sort((a, b) => expiryOf(a) - expiryOf(b))
}

// Everything the "Dit lån" details view needs about one digital loan.
// Exactly one of `orderId`/`loanId` is set: orderId opens the Publizon
// reader/player, loanId the WeDoBooks one.
export type SelectedLoan = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  creators: string
  dueDate: string
  loanDate?: string
  orderId?: string
  loanId?: string
  workId: string
  category: TMaterialCategory
  label: string
}

// Returns null when the loan (or its expiry) is missing.
export const buildSelectedLoan = (
  work: WorkTeaserSearchPageFragment,
  loanData: LoanListResult,
  biblioLoans?: DigitalLoan[]
): SelectedLoan | null => {
  const manifestation = work.manifestations.all[0]
  const shared = {
    manifestation,
    title: work.titles.full[0],
    creators: displayCreators(work.creators, 1),
    workId: work.workId,
    category: getMaterialCategory(manifestation.materialTypes[0]?.materialTypeSpecific.code),
    label: getManifestationLabel(manifestation),
  }

  const loan = digitalLoanForWork(work, loanData)
  if (loan?.loanExpireDateUtc) {
    return {
      ...shared,
      dueDate: loan.loanExpireDateUtc,
      loanDate: loan.orderDateUtc ?? undefined,
      orderId: loan.orderId ?? undefined,
    }
  }

  const biblioLoan = biblioLoanForWork(work, biblioLoans)
  if (biblioLoan) {
    return {
      ...shared,
      dueDate: biblioLoan.endDate,
      loanDate: biblioLoan.startDate,
      loanId: biblioLoan.loanId,
    }
  }

  return null
}
