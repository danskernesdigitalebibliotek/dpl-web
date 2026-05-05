import { Factory } from "fishery";
import {
  ReservationResponse,
  ReservationDetails,
  ReservationResult
} from "@dpl/service-layer/fbs";

/**
 * Factory for FBS reservation details
 */
export const reservationDetailsFactory = Factory.define<ReservationDetails>(
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
export const reservationResultFactory = Factory.define<ReservationResult>(
  () => ({
    result: "success",
    recordId: "12345678",
    reservationDetails: reservationDetailsFactory.build()
  })
);

/**
 * Factory for FBS reservation response
 */
export const reservationResponseFactory = Factory.define<ReservationResponse>(
  () => ({
    success: true,
    reservationResults: [reservationResultFactory.build()]
  })
);
