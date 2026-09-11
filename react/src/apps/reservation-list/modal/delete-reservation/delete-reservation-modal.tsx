import React, { FC, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../../../core/utils/modal";
import { useText } from "../../../../core/utils/text";
import DeleteReservationContent from "./delete-reservation-content";
import {
  getGetReservationsV2QueryKey,
  useDeleteReservations
} from "../../../../core/fbs/fbs";
import {
  getGetV1LoanstatusIdentifierQueryKey,
  getGetV1UserReservationsQueryKey,
  useDeleteV1UserReservationsIdentifier
} from "../../../../core/publizon/publizon";
import { useMultipleRequestsWithStatus } from "../../../../core/utils/useRequestsWithStatus";
import {
  OperationDigital,
  OperationPhysical,
  OperationPublizon,
  ParamsDigital,
  ParamsPhysical,
  ParamsPublizon,
  requestsAndReservations
} from "./helper";
import {
  useDigitalDeleteReservation,
  digitalLoanDecisionQueryKey,
  digitalLoanQuotasQueryKey,
  digitalReservationsQueryKey
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import ModalMessage from "../../../../components/message/modal-message/ModalMessage";
import { ApiResult } from "../../../../core/publizon/model";
import {
  hasDigitalReservationId,
  reservationId,
  ReservationType
} from "../../../../core/utils/types/reservation-type";
import { getModalIds } from "../../../../core/utils/helpers/modal-helpers";

interface DeleteReservationModalProps {
  modalId: string;
  reservations: ReservationType[];
}

export function deleteReservationModalId(reservation: ReservationType): string {
  const prefix = String(getModalIds().deleteReservation);
  const fragment = reservationId(reservation);
  // TODO: Use constructModalId() instead of string concatenation.
  return `${prefix}${fragment}`;
}

const DeleteReservationModal: FC<DeleteReservationModalProps> = ({
  modalId,
  reservations
}) => {
  const t = useText();
  const queryClient = useQueryClient();
  const { mutate: deletePhysicalReservation } = useDeleteReservations();
  const { mutate: deletePublizonReservation } =
    useDeleteV1UserReservationsIdentifier();
  const { mutate: deleteDigitalReservation } = useDigitalDeleteReservation();
  const [deletedReservations, setDeletedReservations] = useState<number | null>(
    null
  );

  const {
    requests,
    reservationsPhysical,
    reservationsPublizon,
    reservationsDigital
  } = useMemo(
    () =>
      requestsAndReservations({
        operations: {
          publizon: deletePublizonReservation,
          physical: deletePhysicalReservation,
          digital: deleteDigitalReservation
        },
        reservations
      }),
    [
      deletePublizonReservation,
      deletePhysicalReservation,
      deleteDigitalReservation,
      reservations
    ]
  );

  const {
    handler: removeReservationsHandler,
    requestStatus,
    setRequestStatus
  } = useMultipleRequestsWithStatus<
    OperationPhysical | OperationPublizon | OperationDigital,
    ParamsPhysical | ParamsPublizon | ParamsDigital,
    ApiResult | boolean | void | null
  >({
    requests,
    onSuccess: () => {
      // Since we got success, we can assume that all reservations
      // were successfully deleted.
      setDeletedReservations(reservations.length);
      // Invalidate queries to update the UI.
      queryClient.invalidateQueries({
        queryKey: getGetV1UserReservationsQueryKey()
      });
      queryClient.invalidateQueries({
        queryKey: getGetReservationsV2QueryKey()
      });
      queryClient.invalidateQueries({
        queryKey: digitalReservationsQueryKey()
      });
      if (reservations.length) {
        reservations.forEach((res) => {
          if (res.identifier) {
            queryClient.invalidateQueries({
              queryKey: getGetV1LoanstatusIdentifierQueryKey(res.identifier)
            });
          }
          // The material page derives its button from the can-loan answer,
          // which was given while the reservation still existed.
          if (hasDigitalReservationId(res)) {
            queryClient.invalidateQueries({
              queryKey: digitalLoanDecisionQueryKey(res.identifier ?? null)
            });
          }
        });
      }
      if (reservationsDigital.length) {
        queryClient.invalidateQueries({
          queryKey: digitalLoanQuotasQueryKey()
        });
      }
    }
  });

  const removeSelectedReservationsHandler = () => {
    if (
      reservationsPhysical.length ||
      reservationsPublizon.length ||
      reservationsDigital.length
    ) {
      removeReservationsHandler();
    }
  };

  if (!reservations) return null;

  const ctaButtonParams = {
    text: t("deleteReservationModalButtonText"),
    closeAllModals: true,
    callback: () => {
      setRequestStatus("idle");
      setDeletedReservations(null);
    }
  };

  return (
    <Modal
      modalId={modalId}
      classNames="modal-cta modal-padding"
      closeModalAriaLabelText={t("deleteReservationModalCloseModalText")}
      screenReaderModalDescriptionText={t(
        "deleteReservationModalAriaDescriptionText"
      )}
      eventCallbacks={{
        close: () => {
          setRequestStatus("idle");
          setDeletedReservations(null);
        }
      }}
    >
      {["idle", "pending"].includes(requestStatus) && (
        <DeleteReservationContent
          deleteReservation={() => removeSelectedReservationsHandler()}
          reservationsCount={reservations.length}
          deletionStatus={requestStatus}
        />
      )}
      {requestStatus === "success" && (
        <ModalMessage
          title={t("deleteReservationModalSuccessTitleText", {
            count: deletedReservations ?? 1
          })}
          subTitle={t("deleteReservationModalSuccessStatusText", {
            count: deletedReservations ?? 0
          })}
          ctaButton={ctaButtonParams}
        />
      )}

      {requestStatus === "error" && (
        <ModalMessage
          title={t("deleteReservationModalErrorsTitleText")}
          subTitle={t("deleteReservationModalErrorsStatusText")}
          ctaButton={ctaButtonParams}
        />
      )}
    </Modal>
  );
};

export default DeleteReservationModal;
