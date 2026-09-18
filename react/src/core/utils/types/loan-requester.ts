import { ApiResult, CreateLoanResult } from "../../publizon/model";
import { RequestStatus } from "./request";

/** What came of asking, in the same shape whichever provider answered. */
export type LoanRequestOutcome = {
  status: RequestStatus;
  /**
   * A loan answers with what the receipt shows. Absent where there is nothing
   * to show yet - a redeemed offer answers with the loan id only, so the
   * expiration date is not known until the loan list is refetched.
   */
  loanResponse?: CreateLoanResult;
  /** The provider's own error body, where it gives one worth showing. */
  error?: ApiResult;
};

type ReportOutcome = (outcome: LoanRequestOutcome) => void;

/**
 * Acquiring a digital material - the write-side counterpart to
 * ReaderPlayerState, and provider-neutral for the same reason: anything
 * specific to Publizon or to the adapter belongs behind this type, not in it,
 * so the provider being migrated away from can be deleted without touching
 * the caller.
 */
export type LoanRequester = {
  loan: (materialId: string, report: ReportOutcome) => void;
  reserve: (materialId: string, report: ReportOutcome) => void;
  /** Only the adapter has a redeem step - see ReaderPlayerState.offerId. */
  acceptOffer?: (offerId: string, report: ReportOutcome) => void;
  /** True until the request's read-back has landed. */
  isPending: boolean;
};
