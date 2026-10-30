import { useQueryClient } from "@tanstack/react-query";
import {
  digitalLoanQuotasQueryKey,
  isRequestGranted,
  useDigitalAcceptOffer,
  useDigitalCreateLoan,
  useDigitalCreateReservation
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useLoanReservationTracking from "../statistics/useLoanReservationTracking";
import {
  awaitReadBack,
  digitalReadBackKeys
} from "./helpers/digital-loan-read-back";
import { loanWasCreated } from "./helpers/digital-loan-request";
import { LoanRequester } from "./types/loan-requester";
import { WorkId } from "./types/ids";

type DigitalLoanRequestsType = {
  workId: WorkId;
  /** The material on screen, which a redeemed offer is read back for. */
  materialId: string | null;
};

/**
 * Borrowing, reserving and redeeming through the Biblio adapter. Tracking and
 * read-back sit on the mutations, as the callers' callbacks are skipped if the
 * modal closes first.
 */
const useDigitalLoanRequests = ({
  workId,
  materialId
}: DigitalLoanRequestsType): LoanRequester => {
  const queryClient = useQueryClient();
  const { trackLoan, trackReservation } = useLoanReservationTracking(workId);

  const readBack = (changedMaterialId: string | null) => {
    // Not shown on the receipt, so not awaited.
    queryClient.invalidateQueries({ queryKey: digitalLoanQuotasQueryKey() });

    return awaitReadBack(queryClient, digitalReadBackKeys(changedMaterialId));
  };

  const { mutate: createLoan, isPending: isLoaning } = useDigitalCreateLoan({
    onSuccess: (result, requestedMaterialId) => {
      // Accepted but not acted on: nothing to track or refetch.
      if (!loanWasCreated(result)) return undefined;
      trackLoan();
      return readBack(requestedMaterialId);
    }
  });

  const { mutate: createReservation, isPending: isReserving } =
    useDigitalCreateReservation({
      onSuccess: (result, requestedMaterialId) => {
        if (!isRequestGranted(result.status)) return undefined;
        trackReservation();
        return readBack(requestedMaterialId);
      }
    });

  const { mutate: claimOffer, isPending: isAcceptingOffer } =
    useDigitalAcceptOffer({
      onSuccess: (result) => {
        if (!result.success) return undefined;
        trackLoan();
        // Keyed by the offer, so the material is the one on screen.
        return readBack(materialId);
      }
    });

  return {
    loan: (id, report) =>
      createLoan(id, {
        onSuccess: (result) =>
          report(
            loanWasCreated(result)
              ? {
                  status: "success",
                  loanResponse: { expirationDateUtc: result.loan.endDate }
                }
              : { status: "error" }
          ),
        onError: () => report({ status: "error" })
      }),

    reserve: (id, report) =>
      createReservation(id, {
        // The adapter refuses with a 200, so only a granted decision may tell
        // the user they are queued.
        onSuccess: (result) =>
          report({
            status: isRequestGranted(result.status) ? "success" : "error"
          }),
        onError: () => report({ status: "error" })
      }),

    acceptOffer: (offerId, report) =>
      claimOffer(offerId, {
        onSuccess: (result) =>
          report({ status: result.success ? "success" : "error" }),
        onError: () => report({ status: "error" })
      }),

    isPending: isLoaning || isReserving || isAcceptingOffer
  };
};

export default useDigitalLoanRequests;
