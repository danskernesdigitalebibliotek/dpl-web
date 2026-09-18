import { useQueryClient } from "@tanstack/react-query";
import {
  getGetV1LoanstatusIdentifierQueryKey,
  getGetV1UserLoansQueryKey,
  getGetV1UserReservationsQueryKey,
  usePostV1UserLoansIdentifier,
  usePostV1UserReservationsIdentifier
} from "../publizon/publizon";
import PublizonServiceError from "../publizon/mutator/PublizonServiceError";
import useLoanReservationTracking from "../statistics/useLoanReservationTracking";
import { usePatronData } from "./helpers/usePatronData";
import { awaitReadBack } from "./helpers/digital-loan-read-back";
import { publizonReservationContact } from "./helpers/digital-loan-request";
import { LoanRequester } from "./types/loan-requester";
import { WorkId } from "./types/ids";

/** Publizon reports a refusal in a body of its own; anything else has none. */
const publizonErrorBody = (err: unknown) =>
  err instanceof PublizonServiceError ? err.responseBody : undefined;

/**
 * Borrowing and reserving through Publizon.
 */
const usePublizonLoanRequests = ({
  workId
}: {
  workId: WorkId;
}): LoanRequester => {
  const queryClient = useQueryClient();
  const { trackLoan, trackReservation } = useLoanReservationTracking(workId);
  const { data: userData } = usePatronData();

  const { mutate: createLoan, isPending: isLoaning } =
    usePostV1UserLoansIdentifier({
      mutation: {
        onSuccess: (_result, { identifier: materialId }) => {
          trackLoan();
          return awaitReadBack(queryClient, [
            getGetV1UserLoansQueryKey(),
            getGetV1LoanstatusIdentifierQueryKey(materialId)
          ]);
        }
      }
    });

  const { mutate: createReservation, isPending: isReserving } =
    usePostV1UserReservationsIdentifier({
      mutation: {
        onSuccess: (_result, { identifier: materialId }) => {
          trackReservation();
          return awaitReadBack(queryClient, [
            getGetV1UserReservationsQueryKey(),
            getGetV1LoanstatusIdentifierQueryKey(materialId)
          ]);
        }
      }
    });

  return {
    loan: (id, report) =>
      createLoan(
        { identifier: id },
        {
          onSuccess: (loanResponse) =>
            report({ status: "success", loanResponse }),
          onError: (err) =>
            report({ status: "error", error: publizonErrorBody(err) })
        }
      ),

    reserve: (id, report) => {
      // Publizon takes an email and a phone number to notify with, so a
      // request without a patron to read them off cannot be made.
      if (!userData?.patron) return;

      createReservation(
        { identifier: id, data: publizonReservationContact(userData.patron) },
        {
          onSuccess: () => report({ status: "success" }),
          onError: (err) =>
            report({ status: "error", error: publizonErrorBody(err) })
        }
      );
    },

    isPending: isLoaning || isReserving
  };
};

export default usePublizonLoanRequests;
