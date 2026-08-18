import React, { FC, useState } from "react";
import { isDigital, removeLoansWithDuplicateDueDate } from "../utils/helpers";
import StackableMaterial from "../materials/stackable-material/stackable-material";
import DigitalLoanCard from "../materials/digital-loan-card/digital-loan-card";
import { ListView } from "../../../core/utils/types/list-view";
import { LoanType } from "../../../core/utils/types/loan-type";
import { listId } from "../../../core/utils/types/list-type";
import { useText } from "../../../core/utils/text";
import PlayerModal from "../../../components/material/player-modal/PlayerModal";
import { playerModalId } from "../../../components/material/player-modal/helper";
import { useModalButtonHandler } from "../../../core/utils/modal";

interface LoanListItemProps {
  loans: LoanType[];
  view: ListView;
  dueDates?: string[];
  openLoanDetailsModal: (loan: LoanType) => void;
  openDueDateModal: (dueDate: string) => void;
  indexOfFocus: number | null;
  dataCy?: string;
}

/**
 * A stable React key for a loan row.
 *
 * Keying on loanId is not enough: digital loans carry none, so every digital
 * row would share a key and React would reuse rows across loans. listId()
 * covers all three providers, but it throws for an item with no usable id at
 * all - a Publizon loan whose libraryBook has no identifier - and a missing
 * key is not worth taking the whole list down for.
 */
const loanKey = (loan: LoanType, index: number) => {
  try {
    return listId(loan);
  } catch {
    return `loan-${index}`;
  }
};

const LoanListItems: FC<LoanListItemProps> = ({
  loans,
  view,
  dueDates,
  openDueDateModal,
  openLoanDetailsModal,
  indexOfFocus,
  dataCy = "loan-list-items"
}) => {
  const t = useText();
  const { open } = useModalButtonHandler();
  const [activePlayerOrderId, setActivePlayerOrderId] = useState<string | null>(
    null
  );

  const handlePlayDigital = (orderId: string) => {
    setActivePlayerOrderId(orderId);
    // PlayerModal only mounts after the state update flushes; defer `open` to
    // the next microtask so the modal exists when the handler runs.
    queueMicrotask(() => open(playerModalId(orderId)));
  };

  return (
    // explanation for screen readers used in additional-materials-button
    // It is located here to avoid duplicate ids in the dom
    <div data-cy={dataCy} className="list-reservation-container my-32">
      <div
        className="list-reservation__hidden-explanation"
        id="materials-modal-text"
      >
        {t("loanListDueDateModalAriaLabelText")}
      </div>
      {activePlayerOrderId && (
        <PlayerModal key={activePlayerOrderId} orderId={activePlayerOrderId} />
      )}
      {view === "stack" &&
        dueDates &&
        dueDates.map((uniqueDueDate: string, i) => {
          // Stack items:
          // if multiple items have the same due date, they are a "stack"
          // which means styling making it look like there are multiple materials,
          // but only _one_ with said due date is visible.
          const loansUniqueDueDate = removeLoansWithDuplicateDueDate(
            uniqueDueDate,
            loans
          );
          const loan = loansUniqueDueDate[0];
          if (!loan) return <ul key={i} />;
          return (
            <ul key={i}>
              <StackableMaterial
                focused={i === indexOfFocus}
                openDueDateModal={openDueDateModal}
                openLoanDetailsModal={openLoanDetailsModal}
                loan={loan}
                item={loan}
                loanId={loan.loanId}
                key={loanKey(loan, i)}
                // -1 because it is _additional_ to the one displayed
                additionalMaterials={loansUniqueDueDate.length - 1}
              />
            </ul>
          );
        })}
      {view === "list" && (
        <ul>
          {loans.map((loan, i) =>
            isDigital(loan) ? (
              <DigitalLoanCard
                openLoanDetailsModal={openLoanDetailsModal}
                onPlayDigital={handlePlayDigital}
                loan={loan}
                item={loan}
                loanId={loan.loanId}
                key={loanKey(loan, i)}
              />
            ) : (
              <StackableMaterial
                focused={i === indexOfFocus}
                openLoanDetailsModal={openLoanDetailsModal}
                item={loan}
                loanId={loan.loanId}
                key={loanKey(loan, i)}
                loan={loan}
                // Zero, as it is not stacked
                additionalMaterials={0}
              />
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default LoanListItems;
