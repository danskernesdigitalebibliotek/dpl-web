import { DigitalProvider } from "./digital-provider";
import { ListType } from "./list-type";

export interface LoanType extends ListType {
  dueDate?: string | null;
  loanDate?: string | null;
  periodical?: string | null;
  isRenewable: boolean;
  materialItemNumber?: string | null;
  renewalStatusList: string[];
  loanType: string | null;
  orderId?: string | null;
  /**
   * Which service issued the loan, and therefore which reader/player opens it.
   * Unset for physical loans, which open nothing.
   *
   * The same fact `useReaderPlayer` reports as `holdingProvider`, named for
   * the distinction that matters there: on a library that has switched, the
   * provider a material is BORROWED from is no longer the one an existing loan
   * is HELD by. A loan is always a holding, so it needs no such qualifier.
   *
   * The loan list mixes providers: after a library switches to the adapter its
   * patrons still hold Publizon loans until those expire, and each has to open
   * where it was made. `orderId` alone cannot say which - Publizon's is an
   * order id and Biblio's a loan id, and they are indistinguishable by shape.
   */
  digitalProvider?: DigitalProvider | null;
}

export function isLoanType(item: ListType): item is LoanType {
  return !!item.loanId || !!item.identifier;
}

export function loanId(loan: LoanType): string {
  return String(loan.loanId || loan.identifier);
}
