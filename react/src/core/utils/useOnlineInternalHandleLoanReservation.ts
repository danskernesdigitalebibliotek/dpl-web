import { QueryKey, useQueryClient } from "@tanstack/react-query";
import {
  getGetV1LoanstatusIdentifierQueryKey,
  getGetV1UserLoansQueryKey,
  getGetV1UserReservationsQueryKey,
  usePostV1UserLoansIdentifier,
  usePostV1UserReservationsIdentifier
} from "../../core/publizon/publizon";
import { usePatronData } from "../../core/utils/helpers/usePatronData";
import useReaderPlayer from "../../core/utils/useReaderPlayer";
import { useUrls } from "../../core/utils/url";
import { useModalButtonHandler } from "../../core/utils/modal";
import {
  getLoanableManifestation,
  onlineInternalModalId
} from "../../apps/material/helper";
import { formatDanishPhoneNumber } from "../../core/utils/helpers/general";
import { Manifestation } from "../../core/utils/types/entities";
import { RequestStatus } from "../../core/utils/types/request";
import { ApiResult, CreateLoanResult } from "../publizon/model";
import PublizonServiceError from "../publizon/mutator/PublizonServiceError";
import {
  useDigitalCreateLoan,
  useDigitalCreateReservation,
  useDigitalAcceptOffer,
  digitalLoanDecisionQueryKey,
  digitalLoanQuotasQueryKey,
  digitalLoansQueryKey,
  digitalReservationsQueryKey,
  isRequestGranted
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import { useEventStatistics } from "../statistics/useStatistics";
import { statistics } from "../statistics/statistics";
import { WorkId } from "./types/ids";
import useBiblioAdapter from "./useBiblioAdapter";

type useOnlineInternalHandleLoanReservationType = {
  manifestations: Manifestation[];
  openModal: boolean;
  setReservationStatus?: (status: RequestStatus) => void;
  setLoanResponse?: (response: CreateLoanResult | null) => void;
  setLoanStatus?: (status: RequestStatus) => void;
  setReservationOrLoanErrorResponse?: (error: ApiResult) => void;
  workId: WorkId;
  modalsToClose?: string[];
};

/**
 * How long a loan or reservation waits for the lists it changed to answer
 * before the user is told it went through anyway. react-query retries a
 * failed refetch with backoff, and a connection that drops mid-refetch pauses
 * it until the device is back - neither may hold a receipt hostage for
 * something the server has already done.
 */
const readBackGraceMs = 3000;

const useOnlineInternalHandleLoanReservation = ({
  manifestations,
  openModal,
  setReservationStatus,
  setLoanResponse,
  setLoanStatus,
  setReservationOrLoanErrorResponse,
  workId,
  modalsToClose
}: useOnlineInternalHandleLoanReservationType) => {
  const queryClient = useQueryClient();
  const u = useUrls();
  const authUrl = u("authUrl");
  const { openGuarded } = useModalButtonHandler();
  const { track } = useEventStatistics();
  const viaBiblioAdapter = useBiblioAdapter();
  const { data: userData } = usePatronData();

  // No falling back: useReaderPlayer only reports a material as obtainable
  // when the lending provider said so, so a material the adapter cannot lend
  // never reaches these branches. offerId is set only by the service layer.
  const {
    canBeLoaned,
    canBeReserved,
    identifier,
    offerId: digitalOfferId
  } = useReaderPlayer(getLoanableManifestation(manifestations));

  const trackLoan = () =>
    track("click", {
      id: statistics.publizonLoan.id,
      name: statistics.publizonLoan.name,
      trackedData: workId
    });
  const trackReservation = () =>
    track("click", {
      id: statistics.publizonReserve.id,
      name: statistics.publizonReserve.name,
      trackedData: workId
    });

  /**
   * Refetch the given lists and answer once they have landed, or once the
   * grace period is up, whichever comes first.
   *
   * The mutations below await this, which is what keeps them pending until
   * the read-back is in: the receipt hands the user the same buttons the
   * material page has, and read off lists that have not caught up they offer
   * the loan that was just made. `refetchType: "all"` so the promise means
   * "the answer is in" even for a list nothing is showing at the time.
   */
  const invalidate = (...queryKeys: QueryKey[]) =>
    Promise.race([
      Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey, refetchType: "all" })
        )
      ),
      new Promise((resolve) => {
        setTimeout(resolve, readBackGraceMs);
      })
    ]);

  /** Everything the adapter's answer for this material was derived from. */
  const invalidateDigital = () => {
    // The quota is read on the material page, never on the receipt, so it is
    // refreshed without holding the user up.
    queryClient.invalidateQueries({ queryKey: digitalLoanQuotasQueryKey() });

    return invalidate(
      digitalLoansQueryKey(),
      digitalReservationsQueryKey(),
      digitalLoanDecisionQueryKey(identifier)
    );
  };

  /** Publizon's half of the same staleness. */
  const invalidatePublizon = (holdings: QueryKey, materialId: string) =>
    invalidate(holdings, getGetV1LoanstatusIdentifierQueryKey(materialId));

  // What follows from the request itself - counting it, and refetching what
  // it changed - hangs off the mutations rather than off the mutate calls
  // below: those belong to the modal, and are skipped altogether if the user
  // closes it while the read-back is still running.
  const { mutate: mutateLoan, isPending: isLoaningViaPublizon } =
    usePostV1UserLoansIdentifier({
      mutation: {
        onSuccess: (_result, { identifier: materialId }) => {
          trackLoan();
          return invalidatePublizon(getGetV1UserLoansQueryKey(), materialId);
        }
      }
    });
  const { mutate: mutateDigitalLoan, isPending: isLoaningViaAdapter } =
    useDigitalCreateLoan({
      onSuccess: (result) => {
        // A request the adapter accepted without acting on - a spent quota,
        // say - changed nothing, so there is nothing to count or refetch.
        if (!result.loan) return undefined;
        trackLoan();
        return invalidateDigital();
      }
    });
  const { mutate: mutateReservation, isPending: isReservingViaPublizon } =
    usePostV1UserReservationsIdentifier({
      mutation: {
        onSuccess: (_result, { identifier: materialId }) => {
          trackReservation();
          return invalidatePublizon(
            getGetV1UserReservationsQueryKey(),
            materialId
          );
        }
      }
    });
  const { mutate: mutateDigitalReservation, isPending: isReservingViaAdapter } =
    useDigitalCreateReservation({
      onSuccess: (result) => {
        if (!isRequestGranted(result.status)) return undefined;
        trackReservation();
        return invalidateDigital();
      }
    });
  const { mutate: mutateAcceptOffer, isPending: isAcceptingOffer } =
    useDigitalAcceptOffer({
      onSuccess: (result) => {
        if (!result.success) return undefined;
        trackLoan();
        return invalidateDigital();
      }
    });

  // A request is in flight until its read-back has landed, because that is
  // what the mutations above wait for.
  const isSubmitting =
    isLoaningViaPublizon ||
    isLoaningViaAdapter ||
    isReservingViaPublizon ||
    isReservingViaAdapter ||
    isAcceptingOffer;

  const reportLoan = (status: RequestStatus) => setLoanStatus?.(status);
  const reportReservation = (status: RequestStatus) =>
    setReservationStatus?.(status);
  const reportPublizonError = (err: unknown) => {
    if (err instanceof PublizonServiceError) {
      setReservationOrLoanErrorResponse?.(err.responseBody);
    }
  };

  const acceptOffer = (offerId: string) => {
    mutateAcceptOffer(offerId, {
      onSuccess: (result) => {
        if (!result.success) {
          reportLoan("error");
          return;
        }
        // Accepting an offer answers with the loan id only, so the
        // expiration date is not known until the loan list is refetched.
        setLoanResponse?.(null);
        reportLoan("success");
      },
      onError: () => reportLoan("error")
    });
  };

  const loanViaAdapter = (materialId: string) => {
    mutateDigitalLoan(materialId, {
      onSuccess: (result) => {
        // The adapter can accept the request without creating a loan,
        // eg. when a quota is exceeded.
        if (!result.loan) {
          reportLoan("error");
          return;
        }
        // Map to the shape the success modal expects.
        setLoanResponse?.({ expirationDateUtc: result.loan.endDate });
        reportLoan("success");
      },
      onError: () => reportLoan("error")
    });
  };

  const loanViaPublizon = (materialId: string) => {
    mutateLoan(
      { identifier: materialId },
      {
        onSuccess: (res) => {
          setLoanResponse?.(res);
          reportLoan("success");
        },
        onError: (err) => {
          reportPublizonError(err);
          reportLoan("error");
        }
      }
    );
  };

  const reserveViaAdapter = (materialId: string) => {
    mutateDigitalReservation(materialId, {
      onSuccess: (result) => {
        // The adapter answers 200 with a decision rather than an error when
        // it refuses, so a request it accepted but did not act on must not
        // tell the user they are queued.
        if (!isRequestGranted(result.status)) {
          reportReservation("error");
          return;
        }
        reportReservation("success");
      },
      onError: () => reportReservation("error")
    });
  };

  // Publizon takes email and phone number to notify with - the adapter, by
  // contrast, derives the user from the token and needs no contact details.
  const reserveViaPublizon = (materialId: string) => {
    if (!userData?.patron) {
      return;
    }
    const { emailAddress, phoneNumber } = userData.patron;
    mutateReservation(
      {
        identifier: materialId,
        data: {
          ...(emailAddress && { email: emailAddress }),
          ...(phoneNumber && {
            phoneNumber: formatDanishPhoneNumber(phoneNumber)
          })
        }
      },
      {
        onSuccess: () => reportReservation("success"),
        onError: (err) => {
          reportPublizonError(err);
          reportReservation("error");
        }
      }
    );
  };

  const handleModalLoanReservation = () => {
    if (openModal) {
      openGuarded({
        authUrl,
        modalId: onlineInternalModalId(manifestations),
        options: { modalsToClose }
      });
      return;
    }

    if (canBeLoaned && identifier) {
      if (!viaBiblioAdapter) {
        loanViaPublizon(identifier);
      } else if (digitalOfferId) {
        // Publizon has no explicit redeem step - a redeemable reservation
        // just shows the loan button - but the service layer requires the
        // offer to be accepted instead of borrowing the material anew.
        acceptOffer(digitalOfferId);
      } else {
        loanViaAdapter(identifier);
      }
      return;
    }

    if (canBeReserved && identifier) {
      if (viaBiblioAdapter) {
        reserveViaAdapter(identifier);
      } else {
        reserveViaPublizon(identifier);
      }
    }
  };

  return { handleModalLoanReservation, isSubmitting };
};

export default useOnlineInternalHandleLoanReservation;
