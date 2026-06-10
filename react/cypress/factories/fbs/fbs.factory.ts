import { Factory } from "fishery";
import {
  ReservationResponseV2,
  ReservationDetailsV2,
  ReservationResultV2
} from "../../../src/core/fbs/model";
import { LoanV2 } from "../../../src/core/fbs/model/loanV2";

/**
 * Factory for FBS reservation details
 */
export const reservationDetailsFactory = Factory.define<ReservationDetailsV2>(
  () => ({
    reservationId: 12345,
    recordId: "12345678",
    state: "reserved",
    pickupBranch: "DK-775100",
    pickupDeadline: undefined,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    dateOfReservation: new Date().toISOString(),
    numberInQueue: 3,
    periodical: undefined,
    pickupNumber: undefined,
    ilBibliographicRecord: undefined,
    transactionId: "txn-001",
    reservationType: "NORMAL"
  })
);

/**
 * Factory for FBS reservation result
 */
export const reservationResultFactory = Factory.define<ReservationResultV2>(
  () => ({
    result: "success",
    recordId: "12345678",
    reservationDetails: reservationDetailsFactory.build()
  })
);

/**
 * Factory for FBS reservation response
 */
export const reservationResponseFactory = Factory.define<ReservationResponseV2>(
  () => ({
    success: true,
    reservationResults: [reservationResultFactory.build()]
  })
);

/**
 * Factory for an FBS physical loan (LoanV2). Defaults to a renewable loan
 * with a 14-day due date so the loan list renders without warnings.
 */
export const fbsLoanFactory = Factory.define<LoanV2>(() => ({
  isLongtermLoan: false,
  isRenewable: true,
  renewalStatusList: [],
  loanDetails: {
    loanId: 956250508,
    materialItemNumber: "3846990827",
    recordId: "28847238",
    periodical: undefined,
    loanDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    loanType: "loan",
    ilBibliographicRecord: undefined,
    materialGroup: {
      name: "standard",
      description: "Standard loan period"
    }
  }
}));
