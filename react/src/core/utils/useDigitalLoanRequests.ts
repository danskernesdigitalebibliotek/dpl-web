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
 * Borrowing, reserving and redeeming through the Biblio adapter.
 *
 * What follows from a request going through - counting it, and refetching what
 * it changed - hangs off the mutations rather than off the callers' requests:
 * those belong to the modal, and are skipped altogether if the user closes it
 * while the read-back is still running.
 */
const useDigitalLoanRequests = ({
  workId,
  materialId
}: DigitalLoanRequestsType): LoanRequester => {
  const queryClient = useQueryClient();
  const { trackLoan, trackReservation } = useLoanReservationTracking(workId);

  const readBack = (changedMaterialId: string | null) => {
    // The quota is read on the material page, never on the receipt, so it is
    // refreshed without holding the user up.
    queryClient.invalidateQueries({ queryKey: digitalLoanQuotasQueryKey() });

    return awaitReadBack(queryClient, digitalReadBackKeys(changedMaterialId));
  };

  const { mutate: createLoan, isPending: isLoaning } = useDigitalCreateLoan({
    onSuccess: (result, requestedMaterialId) => {
      // A request the adapter accepted without acting on changed nothing, so
      // there is nothing to count or refetch.
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
        // The adapter answers 200 with a decision rather than an error when it
        // refuses, so a request it accepted but did not act on must not tell
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
