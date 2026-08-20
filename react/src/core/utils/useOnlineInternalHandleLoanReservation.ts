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
  onlineInternalModalId
} from "../../apps/material/helper";
import {
  formatDanishPhoneNumber,
  getAllFaustIds
} from "../../core/utils/helpers/general";
import { Manifestation } from "../../core/utils/types/entities";
import { RequestStatus } from "../../core/utils/types/request";
import { ApiResult, CreateLoanResult } from "../publizon/model";
import PublizonServiceError from "../publizon/mutator/PublizonServiceError";
import {
  useBiblioCreateLoan,
  useBiblioCreateReservation,
  useBiblioAcceptOffer,
  biblioCanLoanQueryKey,
  biblioLoanQuotasQueryKey,
  biblioLoansQueryKey,
  biblioReservationsQueryKey,
  isBiblioRequestGranted
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
  const useBiblio = useBiblioAdapter();
  const { mutate: mutateLoan } = usePostV1UserLoansIdentifier();
  const { mutate: mutateBiblioLoan } = useBiblioCreateLoan();
  const { mutate: mutateReservation } = usePostV1UserReservationsIdentifier();
  const { mutate: mutateBiblioReservation } = useBiblioCreateReservation();
  const { mutate: mutateBiblioAcceptOffer } = useBiblioAcceptOffer();
  const { data: userData } = usePatronData();

  // With the adapter enabled every new loan and reservation goes there, with
  // no falling back: useReaderPlayer only reports a material as obtainable
  // when the lending provider said so, so a material the adapter cannot lend
  // never reaches these branches. Sending it to Publizon instead would keep
  // pulling new loans into the service we are migrating away from.
  //
  // offerId is set when the provider hands out a grant that has to be claimed
  // before it becomes a loan. Only Biblio does; Publizon reports null.
  const {
    canBeLoaned,
    canBeReserved,
    identifier,
    offerId: biblioOfferId
  } = useReaderPlayer(getLoanableManifestation(manifestations));

  const handleModalLoanReservation = () => {
    if (openModal) {
      openGuarded({
        authUrl,
        modalId: onlineInternalModalId(getAllFaustIds(manifestations)),
        options: { modalsToClose }
      });
      return;
    }

    // Everything the adapter's answer for this material was derived from is
    // stale once the user has borrowed or reserved it: the loan and
    // reservation lists, the can-loan decision behind the button, and the
    // quota counts the availability text reads.
    const invalidateBiblio = () => {
      [
        biblioLoansQueryKey(),
        biblioReservationsQueryKey(),
        biblioCanLoanQueryKey(identifier),
        biblioLoanQuotasQueryKey()
      ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    };

    // Publizon has no explicit redeem step - a redeemable reservation just
    // shows the loan button - but Biblio requires the offer to be accepted
    // instead of borrowing the material anew.
    if (canBeLoaned && identifier && useBiblio && biblioOfferId) {
      mutateBiblioAcceptOffer(biblioOfferId, {
        onSuccess: (result) => {
          if (!result.success) {
            if (setLoanStatus) {
              setLoanStatus("error");
            }
            return;
          }
          track("click", {
            id: statistics.publizonLoan.id,
            name: statistics.publizonLoan.name,
            trackedData: workId
          });
          invalidateBiblio();
          if (setLoanStatus) {
            setLoanStatus("success");
          }
          // Accepting an offer answers with the loan id only, so the
          // expiration date is not known until the loan list is refetched.
          if (setLoanResponse) {
            setLoanResponse(null);
          }
        },
        onError: () => {
          if (setLoanStatus) {
            setLoanStatus("error");
          }
        }
      });
      return;
    }

    // During the transition period new digital loans must be created through
    // the Biblio adapter when the library has enabled the feature flag.
    if (canBeLoaned && identifier && useBiblio) {
      mutateBiblioLoan(identifier, {
        onSuccess: (result) => {
          // The adapter can accept the request without creating a loan,
          // eg. when a quota is exceeded.
          if (!result.loan) {
            if (setLoanStatus) {
              setLoanStatus("error");
            }
            return;
          }
          track("click", {
            id: statistics.publizonLoan.id,
            name: statistics.publizonLoan.name,
            trackedData: workId
          });
          invalidateBiblio();
          if (setLoanStatus) {
            setLoanStatus("success");
          }
          if (setLoanResponse) {
            // Map to the shape the success modal expects.
            setLoanResponse({ expirationDateUtc: result.loan.endDate });
          }
        },
        onError: () => {
          if (setLoanStatus) {
            setLoanStatus("error");
          }
        }
      });
      return;
    }

    if (canBeLoaned && identifier) {
      mutateLoan(
        { identifier },
        {
          onSuccess: (res) => {
            track("click", {
              id: statistics.publizonLoan.id,
              name: statistics.publizonLoan.name,
              trackedData: workId
            });
            // Ensure that the button is updated after a successful loan
            queryClient.invalidateQueries({
              queryKey: getGetV1UserLoansQueryKey()
            });
            queryClient.invalidateQueries({
              queryKey: getGetV1LoanstatusIdentifierQueryKey(identifier)
            });
            if (setLoanStatus) {
              setLoanStatus("success");
            }
            if (setLoanResponse) {
              setLoanResponse(res);
            }
          },
          onError: (err) => {
            if (err instanceof PublizonServiceError) {
              if (setReservationOrLoanErrorResponse) {
                setReservationOrLoanErrorResponse(err.responseBody);
              }
            }

            if (setLoanStatus) {
              setLoanStatus("error");
            }
          }
        }
      );
      return;
    }

    // New digital reservations go through the adapter for the materials it
    // holds. The adapter derives the user from the token, so it needs no
    // contact details - Publizon takes email and phone number to notify with.
    if (canBeReserved && identifier && useBiblio) {
      mutateBiblioReservation(identifier, {
        onSuccess: (result) => {
          // The adapter answers 200 with a decision rather than an error when
          // it refuses, so a request it accepted but did not act on must not
          // tell the user they are queued.
          if (!isBiblioRequestGranted(result.status)) {
            if (setReservationStatus) {
              setReservationStatus("error");
            }
            return;
          }
          track("click", {
            id: statistics.publizonReserve.id,
            name: statistics.publizonReserve.name,
            trackedData: workId
          });
          // A reservation can be granted right away, in which case the
          // adapter answers with a loan instead.
          invalidateBiblio();
          if (setReservationStatus) {
            setReservationStatus("success");
          }
        },
        onError: () => {
          if (setReservationStatus) {
            setReservationStatus("error");
          }
        }
      });
      return;
    }

    if (canBeReserved && identifier && userData?.patron) {
      mutateReservation(
        {
          identifier,
          data: {
            ...(userData.patron.emailAddress && {
              email: userData.patron.emailAddress
            }),
            ...(userData.patron.phoneNumber && {
              phoneNumber: formatDanishPhoneNumber(userData.patron.phoneNumber)
            })
          }
        },
        {
          onSuccess: () => {
            track("click", {
              id: statistics.publizonReserve.id,
              name: statistics.publizonReserve.name,
              trackedData: workId
            });
            // Ensure that the button is updated after a successful reservation
            queryClient.invalidateQueries({
              queryKey: getGetV1UserReservationsQueryKey()
            });
            queryClient.invalidateQueries({
              queryKey: getGetV1LoanstatusIdentifierQueryKey(identifier)
            });
            if (setReservationStatus) {
              setReservationStatus("success");
            }
          },
          onError: (err) => {
            if (err instanceof PublizonServiceError) {
              if (setReservationOrLoanErrorResponse) {
                setReservationOrLoanErrorResponse(err.responseBody);
              }
            }
            if (setReservationStatus) {
              setReservationStatus("error");
            }
          }
        }
      );
    }
  };

  return handleModalLoanReservation;
};

export default useOnlineInternalHandleLoanReservation;
