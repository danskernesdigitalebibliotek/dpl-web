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
    language: raw.language,
    publicationDate: raw.publicationDate,
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
    materialItemNumber: raw.materialItemNumber,
    periodical: raw.periodical,
    recordId: raw.recordId,
  }
}

export function mapLoan(raw: LoanV2): Loan {
  return {
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
