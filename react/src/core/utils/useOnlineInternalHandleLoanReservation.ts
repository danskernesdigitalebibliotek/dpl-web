import { useQueryClient } from "@tanstack/react-query";
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
  loanableOnlineInternalModalId
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
  const { mutate: mutateLoan } = usePostV1UserLoansIdentifier();
  const { mutate: mutateDigitalLoan } = useDigitalCreateLoan();
  const { mutate: mutateReservation } = usePostV1UserReservationsIdentifier();
  const { mutate: mutateDigitalReservation } = useDigitalCreateReservation();
  const { mutate: mutateAcceptOffer } = useDigitalAcceptOffer();
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

  const reportLoan = (status: RequestStatus) => setLoanStatus?.(status);
  const reportReservation = (status: RequestStatus) =>
    setReservationStatus?.(status);
  const reportPublizonError = (err: unknown) => {
    if (err instanceof PublizonServiceError) {
      setReservationOrLoanErrorResponse?.(err.responseBody);
    }
  };
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

  // Everything the adapter's answer for this material was derived from is
  // stale once the user has borrowed or reserved it.
  const invalidateDigital = () => {
    [
      digitalLoansQueryKey(),
      digitalReservationsQueryKey(),
      digitalLoanDecisionQueryKey(identifier),
      digitalLoanQuotasQueryKey()
    ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  };

  const acceptOffer = (offerId: string) => {
    mutateAcceptOffer(offerId, {
      onSuccess: (result) => {
        if (!result.success) {
          reportLoan("error");
          return;
        }
        trackLoan();
        invalidateDigital();
        reportLoan("success");
        // Accepting an offer answers with the loan id only, so the
        // expiration date is not known until the loan list is refetched.
        setLoanResponse?.(null);
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
        trackLoan();
        invalidateDigital();
        reportLoan("success");
        // Map to the shape the success modal expects.
        setLoanResponse?.({ expirationDateUtc: result.loan.endDate });
      },
      onError: () => reportLoan("error")
    });
  };

  const loanViaPublizon = (materialId: string) => {
    mutateLoan(
      { identifier: materialId },
      {
        onSuccess: (res) => {
          trackLoan();
          // Ensure that the button is updated after a successful loan
          queryClient.invalidateQueries({
            queryKey: getGetV1UserLoansQueryKey()
          });
          queryClient.invalidateQueries({
            queryKey: getGetV1LoanstatusIdentifierQueryKey(materialId)
          });
          reportLoan("success");
          setLoanResponse?.(res);
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
        trackReservation();
        // A reservation can be granted right away, in which case the
        // adapter answers with a loan instead.
        invalidateDigital();
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
        onSuccess: () => {
          trackReservation();
          // Ensure that the button is updated after a successful reservation
          queryClient.invalidateQueries({
            queryKey: getGetV1UserReservationsQueryKey()
          });
          queryClient.invalidateQueries({
            queryKey: getGetV1LoanstatusIdentifierQueryKey(materialId)
          });
          reportReservation("success");
        },
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
        modalId: loanableOnlineInternalModalId(manifestations),
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

  return handleModalLoanReservation;
};

export default useOnlineInternalHandleLoanReservation;
