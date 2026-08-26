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
  OperationBiblio,
  OperationDigital,
  OperationPhysical,
  ParamsBiblio,
  ParamsDigital,
  ParamsPhysical,
  requestsAndReservations
} from "./helper";
import {
  useDeleteDigitalReservation,
  digitalReservationsQueryKey
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import ModalMessage from "../../../../components/message/modal-message/ModalMessage";
import { ApiResult } from "../../../../core/publizon/model";
import {
  reservationId,
  ReservationType
} from "../../../../core/utils/types/reservation-type";
import { getModalIds } from "../../../../core/utils/helpers/modal-helpers";

interface DeleteReservationModalProps {
  modalId: string;
  reservations: ReservationType[];
}

export function deleteReservationModalId(reservation: ReservationType): string {
  const prefix = String(getModalIds().reservationDelete);
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
  const { mutate: deleteDigitalReservation } = useDeleteDigitalReservation();
  const [deletedReservations, setDeletedReservations] = useState<number | null>(
    null
  );

  const {
    requests,
    reservationsPhysical,
    reservationsDigital,
    reservationsBiblio
  } = useMemo(
    () =>
      requestsAndReservations({
        operations: {
          digital: deletePublizonReservation,
          physical: deletePhysicalReservation,
          biblio: deleteDigitalReservation
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
    OperationPhysical | OperationDigital | OperationBiblio,
    ParamsPhysical | ParamsDigital | ParamsBiblio,
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
        });
      }
    }
  });

  const removeSelectedReservationsHandler = () => {
    if (
      reservationsPhysical.length ||
      reservationsDigital.length ||
      reservationsBiblio.length
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
