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
   * Unset for physical loans. Needed because `orderId` alone cannot say:
   * Publizon's order id and the service layer's loan id are indistinguishable
   * by shape. The same fact `useReaderPlayer` reports as `holdingProvider`.
   */
  digitalProvider?: DigitalProvider | null;
}

export function isLoanType(item: ListType): item is LoanType {
  return !!item.loanId || !!item.identifier;
}

export function loanId(loan: LoanType): string {
  return String(loan.loanId || loan.identifier);
}
