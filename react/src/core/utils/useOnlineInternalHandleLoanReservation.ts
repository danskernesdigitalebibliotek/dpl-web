import { useUrls } from "./url";
import { useModalButtonHandler } from "./modal";
import { RequestStatus } from "./types/request";
import { ApiResult, CreateLoanResult } from "../publizon/model";
import { WorkId } from "./types/ids";
import useBiblioAdapter from "./useBiblioAdapter";
import useDigitalLoanRequests from "./useDigitalLoanRequests";
import usePublizonLoanRequests from "./usePublizonLoanRequests";
import invalidSwitchCase from "./helpers/invalid-switch-case";
import { LoanRequestOutcome } from "./types/loan-requester";
import {
  LoanableMaterial,
  resolveLoanReservationRequest
} from "./helpers/digital-loan-request";

type useOnlineInternalHandleLoanReservationType = {
  openModal: boolean;
  /** The confirmation modal the material page's button opens. */
  modalId: string;
  material: LoanableMaterial;
  setReservationStatus?: (status: RequestStatus) => void;
  setLoanResponse?: (response: CreateLoanResult | null) => void;
  setLoanStatus?: (status: RequestStatus) => void;
  setReservationOrLoanErrorResponse?: (error: ApiResult) => void;
  workId: WorkId;
  modalsToClose?: string[];
};

/**
 * Turns a press on the loan or reserve button into the right request, and the
 * answer into what the modal shows.
 */
const useOnlineInternalHandleLoanReservation = ({
  openModal,
  modalId,
  material,
  setReservationStatus,
  setLoanResponse,
  setLoanStatus,
  setReservationOrLoanErrorResponse,
  workId,
  modalsToClose
}: useOnlineInternalHandleLoanReservationType) => {
  const u = useUrls();
  const authUrl = u("authUrl");
  const { openGuarded } = useModalButtonHandler();
  const viaBiblioAdapter = useBiblioAdapter();

  const digital = useDigitalLoanRequests({
    workId,
    materialId: material.identifier
  });
  const publizon = usePublizonLoanRequests({ workId });
  const requester = viaBiblioAdapter ? digital : publizon;

  const reportLoan = ({ status, loanResponse, error }: LoanRequestOutcome) => {
    if (error) setReservationOrLoanErrorResponse?.(error);
    // Null rather than left alone: the success modal reads this, and a
    // redeemed offer has no expiration date to show yet.
    if (status === "success") setLoanResponse?.(loanResponse ?? null);
    setLoanStatus?.(status);
  };

  const reportReservation = ({ status, error }: LoanRequestOutcome) => {
    if (error) setReservationOrLoanErrorResponse?.(error);
    setReservationStatus?.(status);
  };

  const handleModalLoanReservation = () => {
    const request = resolveLoanReservationRequest({ openModal, ...material });
    if (!request) return;

    switch (request.kind) {
      case "open-modal":
        openGuarded({ authUrl, modalId, options: { modalsToClose } });
        break;
      case "accept-offer":
        requester.acceptOffer?.(request.offerId, reportLoan);
        break;
      case "loan":
        requester.loan(request.materialId, reportLoan);
        break;
      case "reserve":
        requester.reserve(request.materialId, reportReservation);
        break;
      default:
        invalidSwitchCase<void>(request);
    }
  };

  return { handleModalLoanReservation, isSubmitting: requester.isPending };
};

export default useOnlineInternalHandleLoanReservation;
