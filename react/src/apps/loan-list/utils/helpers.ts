import { ListView } from "../../../core/utils/types/list-view";
import { LoanType } from "../../../core/utils/types/loan-type";
import { UseTextFunction } from "../../../core/utils/text";
import { ListType } from "../../../core/utils/types/list-type";

export const removeLoansWithDuplicateDueDate = (
  date: string,
  list: LoanType[]
) => {
  return list.filter(({ dueDate }) => dueDate === date);
};
export const loansAreEmpty = (list: LoanType[] | null) =>
  Array.isArray(list) && list.length === 0;

export const materialsAreStacked = (materialsInStack: number) => {
  return materialsInStack > 0;
};
export const getFromListByKey = (
  list: ListType[],
  key: "identifier" | "faust" | "loanId",
  value: string
) => {
  return list.filter((loan) => String(loan[key]) === value);
};

export const getStatusText = (status: string, t: UseTextFunction) => {
  switch (status) {
    case "deniedMaxRenewalsReached":
      return t("groupModalRenewLoanDeniedMaxRenewalsReachedText");
    case "deniedReserved":
      return t("groupModalRenewLoanDeniedReservedText");
    default:
      return "";
  }
};

export const isDigital = (loan: ListType) => Boolean(loan.identifier);

export const getStackedItems = (
  view: ListView,
  list: LoanType[],
  itemsShown: number,
  dueDates: string[] | undefined | null[]
) => {
  let returnLoans: LoanType[] = [];
  if (view === "stack" && dueDates) {
    // I mean... this...
    // If the due date is null, the stacked item still has to be shown
    let dueDatesCopy = [...dueDates, null];
    dueDatesCopy = dueDatesCopy.slice(0, itemsShown);
    dueDatesCopy.forEach((uniqueDueDate) => {
      returnLoans = returnLoans.concat(
        list.filter(({ dueDate }) => dueDate === uniqueDueDate)
      );
    });
  }
  return returnLoans;
};

export const getLoanDeliveryDate = (
  loanType: LoanType,
  formatDate: (date: string) => string,
  t: UseTextFunction
) => {
  // Set the value of 'neutralText' based on the material type and due date
  return loanType.dueDate
    ? t(
        isDigital(loanType)
          ? "groupModalDueDateDigitalMaterialText"
          : "groupModalDueDateMaterialText",
        {
          placeholders: {
            "@date": formatDate(loanType.dueDate)
          }
        }
      )
    : "";
};
