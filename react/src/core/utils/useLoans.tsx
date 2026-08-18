import { useGetLoansV2 } from "../fbs/fbs";
import { useGetV1UserLoans } from "../publizon/publizon";
import useBiblioLoans from "../biblio/useBiblioLoans";
import { calculateRoundedUpDaysUntil } from "./helpers/date";
import { materialIsOverdue } from "./helpers/general";
import {
  mapBiblioLoanToLoanType,
  mapFBSLoanToLoanType,
  mapPublizonLoanToLoanType
} from "./helpers/list-mapper";
import { LoanType } from "./types/loan-type";
import useBiblioAdapter from "./useBiblioAdapter";
import useLoanThresholds from "./useLoanThresholds";

// Loans with more than warning-threshold days until due
const filterLoansNotOverdue = (loans: LoanType[], warning: number) => {
  return loans.filter(({ dueDate }) => {
    const due: string = dueDate || "";
    const daysUntilExpiration = calculateRoundedUpDaysUntil(due);
    return daysUntilExpiration - warning > 0;
  });
};
// Loans overdue
const filterLoansOverdue = (loans: LoanType[]) => {
  return loans.filter(({ dueDate }) => {
    return materialIsOverdue(dueDate);
  });
};
//
const filterLoansSoonOverdue = (loans: LoanType[], warning: number) => {
  return loans.filter(({ dueDate }) => {
    const due: string = dueDate || "";
    const daysUntilExpiration = calculateRoundedUpDaysUntil(due);
    return (
      daysUntilExpiration - warning <= 0 &&
      daysUntilExpiration - warning >= -warning
    );
  });
};

type Loans = {
  loans: LoanType[];
  overdue: LoanType[];
  soonOverdue: LoanType[];
  farFromOverdue: LoanType[];
  isLoading: boolean;
  isError: boolean;
};

type UseLoansType = {
  all: Loans;
  fbs: Loans;
  // Digital loans from both providers. The key stays "publizon" for backwards
  // compatibility: with the Biblio flag on, a user's older Publizon loans
  // remain in this list alongside the ones made through Biblio.
  publizon: Loans;
};

type UseLoans = () => UseLoansType;

// useLoans is a custom hook that fetches loans from both FBS and the digital
// materials providers and combines them into lists. The loans are then
// divided into three categories: overdue, soon overdue, and far from overdue.
// The hook is NOT responsible for any sorting of the loans.
const useLoans: UseLoans = () => {
  const useBiblio = useBiblioAdapter();
  const {
    data: loansFbs,
    isLoading: isLoadingFbs,
    isError: isErrorFbs
  } = useGetLoansV2();
  const {
    data: loansPublizon,
    isLoading: isLoadingPublizon,
    isError: isErrorPublizon
  } = useGetV1UserLoans();
  const {
    data: loansBiblio,
    isLoading: isLoadingBiblio,
    isError: isErrorBiblio
  } = useBiblioLoans({ enabled: useBiblio });

  const threshold = useLoanThresholds();
  // A disabled query is never loading or in error so the Biblio states only
  // count when the feature flag has enabled the query.
  const isLoadingDigital = isLoadingPublizon || isLoadingBiblio;
  const isErrorDigital = isErrorPublizon || isErrorBiblio;
  const loansIsLoading = isLoadingFbs || isLoadingDigital;
  const loansIsError = isErrorFbs || isErrorDigital;

  // map loans to same type
  const mappedLoansFbs =
    loansFbs && Array.isArray(loansFbs) ? mapFBSLoanToLoanType(loansFbs) : [];
  const mappedLoansPublizon = loansPublizon?.loans
    ? mapPublizonLoanToLoanType(loansPublizon.loans)
        // TODO: is it necessary to filter out loans without dueDate?
        // there are loans without dueDate in the publizon MOCK data
        .filter((item) => item.dueDate)
    : [];
  const mappedLoansBiblio = loansBiblio?.loans
    ? mapBiblioLoanToLoanType(loansBiblio.loans)
    : [];
  const mappedLoansDigital = [...mappedLoansPublizon, ...mappedLoansBiblio];

  // Combine all loans from both FBS and the digital materials provider
  const loans = [...mappedLoansFbs, ...mappedLoansDigital];

  // Combine "overdue loans" from both FBS and the digital materials provider
  const loansOverdueFBS = filterLoansOverdue(mappedLoansFbs);
  const loansOverdueDigital = filterLoansOverdue(mappedLoansDigital);
  const loansOverdue = [...loansOverdueFBS, ...loansOverdueDigital];

  // combine "soon overdue" loans from both FBS and the digital materials
  // provider
  const loansSoonOverdueFBS = filterLoansSoonOverdue(
    mappedLoansFbs,
    threshold.warning
  );
  const loansSoonOverdueDigital = filterLoansSoonOverdue(
    mappedLoansDigital,
    threshold.warning
  );
  const loansSoonOverdue = [...loansSoonOverdueFBS, ...loansSoonOverdueDigital];

  // combine "far from overdue" loans from both FBS and the digital materials
  // provider
  const loansFarFromOverdueFBS = filterLoansNotOverdue(
    mappedLoansFbs,
    threshold.warning
  );
  const loansFarFromOverdueDigital = filterLoansNotOverdue(
    mappedLoansDigital,
    threshold.warning
  );
  const loansFarFromOverdue = [
    ...loansFarFromOverdueFBS,
    ...loansFarFromOverdueDigital
  ];

  return {
    all: {
      loans,
      overdue: loansOverdue,
      soonOverdue: loansSoonOverdue,
      farFromOverdue: loansFarFromOverdue,
      isLoading: loansIsLoading,
      isError: loansIsError
    },
    fbs: {
      loans: mappedLoansFbs,
      overdue: loansOverdueFBS,
      soonOverdue: loansSoonOverdueFBS,
      farFromOverdue: loansFarFromOverdueFBS,
      isLoading: isLoadingFbs,
      isError: isErrorFbs
    },
    publizon: {
      loans: mappedLoansDigital,
      overdue: loansOverdueDigital,
      soonOverdue: loansSoonOverdueDigital,
      farFromOverdue: loansFarFromOverdueDigital,
      isLoading: isLoadingDigital,
      isError: isErrorDigital
    }
  };
};

export default useLoans;
