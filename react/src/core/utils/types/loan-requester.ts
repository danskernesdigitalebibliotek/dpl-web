import { ApiResult, CreateLoanResult } from "../../publizon/model";
import { RequestStatus } from "./request";

/** What came of asking, in the same shape whichever provider answered. */
export type LoanRequestOutcome = {
  status: RequestStatus;
  /**
   * Absent for a redeemed offer, which answers with the loan id only, so the
   * expiration date is not known until the loan list is refetched.
   */
  loanResponse?: CreateLoanResult;
  /** The provider's own error body, where it gives one worth showing. */
  error?: ApiResult;
};

type ReportOutcome = (outcome: LoanRequestOutcome) => void;

/**
 * Acquiring a digital material - the write-side counterpart to
 * ReaderPlayerState. Provider specifics belong behind this type, so Publizon
 * can be removed without touching the caller.
 */
export type LoanRequester = {
  loan: (materialId: string, report: ReportOutcome) => void;
  reserve: (materialId: string, report: ReportOutcome) => void;
  /** Only the adapter has a redeem step - see ReaderPlayerState.offerId. */
  acceptOffer?: (offerId: string, report: ReportOutcome) => void;
  /** True until the request's read-back has landed. */
  isPending: boolean;
};
