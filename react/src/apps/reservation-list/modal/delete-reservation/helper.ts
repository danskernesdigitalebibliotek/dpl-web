import { useDeleteReservations } from "../../../../core/fbs/fbs";
import { DeleteReservationsParams } from "../../../../core/fbs/model/deleteReservationsParams";
import { useDeleteV1UserReservationsIdentifier } from "../../../../core/publizon/publizon";
import { UseTextFunction } from "../../../../core/utils/text";
import { RequestStatus } from "../../../../core/utils/types/request";
import {
  ReservationType,
  hasDigitalReservationId,
  isPhysicalReservation,
  isPublizonReservation
} from "../../../../core/utils/types/reservation-type";
import { useDigitalDeleteReservation } from "@danskernesdigitalebibliotek/dpl-service-layer";

export type OperationPhysical = ReturnType<
  typeof useDeleteReservations
>["mutate"];
export type OperationPublizon = ReturnType<
  typeof useDeleteV1UserReservationsIdentifier
>["mutate"];
export type OperationDigital = ReturnType<
  typeof useDigitalDeleteReservation
>["mutate"];

export type ParamsPhysical = { params: DeleteReservationsParams };
export type ParamsPublizon = Parameters<OperationPublizon>;
// The service layer cancels by the reservation's own id, so the mutation
// takes it directly rather than an object.
export type ParamsDigital = string;

type Request =
  | {
      params: ParamsPhysical;
      operation: OperationPhysical;
    }
  | {
      params: ParamsPublizon;
      operation: OperationPublizon;
    }
  | {
      params: ParamsDigital;
      operation: OperationDigital;
    };

export const getReservationsToDelete = (reservations: ReservationType[]) => {
  if (!reservations.length) {
    return { physical: [], publizon: [], digital: [] };
  }
  const physical = reservations
    .filter(isPhysicalReservation)
    .map(({ reservationIds }) => reservationIds)
    .flat();

  const digital = reservations
    .filter(hasDigitalReservationId)
    .map(({ digitalReservationId }) => digitalReservationId);

  // Both providers carry a material identifier, so the ones the service layer
  // owns are excluded here to keep them from being cancelled through Publizon.
  const publizon = reservations
    .filter(isPublizonReservation)
    .map(({ identifier }) => identifier);

  return { physical, publizon, digital };
};

export const getDeleteButtonLabel = ({
  reservationsCount,
  deletionStatus,
  t
}: {
  reservationsCount: number;
  deletionStatus: RequestStatus;
  t: UseTextFunction;
}) => {
  if (deletionStatus === "pending") {
    return t("deleteReservationModalDeleteProcessingText");
  }

  return t("deleteReservationModalDeleteButtonText", {
    count: reservationsCount
  });
};

export const requestsAndReservations = ({
  reservations,
  operations
}: {
  reservations: ReservationType[];
  operations: {
    physical: OperationPhysical;
    publizon: OperationPublizon;
    digital: OperationDigital;
  };
}): {
  requests: Request[];
  reservationsPhysical: ReturnType<typeof getReservationsToDelete>["physical"];
  reservationsPublizon: ReturnType<typeof getReservationsToDelete>["publizon"];
  reservationsDigital: ReturnType<typeof getReservationsToDelete>["digital"];
} => {
  const {
    physical: reservationsPhysical,
    publizon: reservationsPublizon,
    digital: reservationsDigital
  } = getReservationsToDelete(reservations);

  const requests = [];
  if (reservationsPhysical.length) {
    requests.push({
      params: { params: { reservationid: reservationsPhysical } },
      operation: operations.physical
    });
  }
  reservationsPublizon.forEach((id) => {
    requests.push({
      params: { identifier: String(id) },
      operation: operations.publizon
    });
  });
  reservationsDigital.forEach((id) => {
    requests.push({
      params: id,
      operation: operations.digital
    });
  });

  return {
    requests,
    reservationsPhysical,
    reservationsPublizon,
    reservationsDigital
  };
};

export default {};
