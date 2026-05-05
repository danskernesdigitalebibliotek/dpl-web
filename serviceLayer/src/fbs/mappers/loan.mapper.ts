import type { ILLBibliographicRecord } from "../generated/model/iLLBibliographicRecord"
import type { LoanDetailsV2 } from "../generated/model/loanDetailsV2"
import type { LoanV2 } from "../generated/model/loanV2"
import type { RenewedLoanV2 } from "../generated/model/renewedLoanV2"
import type {
  BibliographicRecord,
  Loan,
  LoanDetails,
  RenewedLoan,
} from "../types"

export function mapBibliographicRecord(
  raw: ILLBibliographicRecord
): BibliographicRecord {
  return {
    author: raw.author,
    bibliographicCategory: raw.bibliographicCategory,
    edition: raw.edition,
    isbn: raw.isbn,
    issn: raw.issn,
    language: raw.language,
    mediumType: raw.mediumType,
    periodicalNumber: raw.periodicalNumber,
    periodicalVolume: raw.periodicalVolume,
    placeOfPublication: raw.placeOfPublication,
    publicationDate: raw.publicationDate,
    publicationDateOfComponent: raw.publicationDateOfComponent,
    publisher: raw.publisher,
    recordId: raw.recordId,
    title: raw.title,
  }
}

export function mapLoanDetails(raw: LoanDetailsV2): LoanDetails {
  return {
    dueDate: raw.dueDate,
    ilBibliographicRecord: raw.ilBibliographicRecord
      ? mapBibliographicRecord(raw.ilBibliographicRecord)
      : undefined,
    loanDate: raw.loanDate,
    loanId: raw.loanId,
    loanType: raw.loanType,
    materialGroup: raw.materialGroup,
    materialItemNumber: raw.materialItemNumber,
    periodical: raw.periodical,
    recordId: raw.recordId,
  }
}

export function mapLoan(raw: LoanV2): Loan {
  return {
    isLongtermLoan: raw.isLongtermLoan,
    isRenewable: raw.isRenewable,
    loanDetails: mapLoanDetails(raw.loanDetails),
    renewalStatusList: raw.renewalStatusList,
  }
}

export function mapRenewedLoan(raw: RenewedLoanV2): RenewedLoan {
  return {
    loanDetails: mapLoanDetails(raw.loanDetails),
    renewalStatus: raw.renewalStatus,
  }
}
