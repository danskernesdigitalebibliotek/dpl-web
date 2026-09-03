import { useDeleteReservations } from "../../../../core/fbs/fbs";
import { DeleteReservationsParams } from "../../../../core/fbs/model/deleteReservationsParams";
import { useDeleteV1UserReservationsIdentifier } from "../../../../core/publizon/publizon";
import { UseTextFunction } from "../../../../core/utils/text";
import { RequestStatus } from "../../../../core/utils/types/request";
import {
  ReservationType,
  isBiblioReservation,
  isDigitalReservation,
  isPhysicalReservation
} from "../../../../core/utils/types/reservation-type";
import { useBiblioDeleteReservation } from "@danskernesdigitalebibliotek/dpl-service-layer";

export type OperationPhysical = ReturnType<
  typeof useDeleteReservations
>["mutate"];
export type OperationDigital = ReturnType<
  typeof useDeleteV1UserReservationsIdentifier
>["mutate"];
export type OperationBiblio = ReturnType<
  typeof useBiblioDeleteReservation
>["mutate"];

export type ParamsPhysical = { params: DeleteReservationsParams };
export type ParamsDigital = Parameters<OperationDigital>;
// Biblio cancels by the reservation's own id, so the mutation takes it
// directly rather than an object.
export type ParamsBiblio = string;

type Request =
  | {
      params: ParamsPhysical;
      operation: OperationPhysical;
    }
  | {
      params: ParamsDigital;
      operation: OperationDigital;
    }
  | {
      params: ParamsBiblio;
      operation: OperationBiblio;
    };

export const getReservationsToDelete = (reservations: ReservationType[]) => {
  if (!reservations.length) {
    return { physical: [], digital: [], biblio: [] };
  }
  const physical = reservations
    .filter(isPhysicalReservation)
    .map(({ reservationIds }) => reservationIds)
    .flat();

  const biblio = reservations
    .filter(isBiblioReservation)
    .map(({ biblioReservationId }) => biblioReservationId);

  // Both providers carry a material identifier, so Biblio reservations are
  // excluded here to keep them from being cancelled through Publizon.
  const digital = reservations
    .filter(
      (reservation) =>
        isDigitalReservation(reservation) && !isBiblioReservation(reservation)
    )
    .map(({ identifier }) => identifier);

  return { physical, digital, biblio };
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
    digital: OperationDigital;
    biblio: OperationBiblio;
  };
}): {
  requests: Request[];
  reservationsPhysical: ReturnType<typeof getReservationsToDelete>["physical"];
  reservationsDigital: ReturnType<typeof getReservationsToDelete>["digital"];
  reservationsBiblio: ReturnType<typeof getReservationsToDelete>["biblio"];
} => {
  const {
    physical: reservationsPhysical,
    digital: reservationsDigital,
    biblio: reservationsBiblio
  } = getReservationsToDelete(reservations);

  const requests = [];
  if (reservationsPhysical.length) {
    requests.push({
      params: { params: { reservationid: reservationsPhysical } },
      operation: operations.physical
    });
  }
  if (reservationsDigital.length) {
    reservationsDigital.forEach((id) => {
      requests.push({
        params: { identifier: String(id) },
        operation: operations.digital
      });
    });
  }
  if (reservationsBiblio.length) {
    reservationsBiblio.forEach((id) => {
      requests.push({
        params: String(id),
        operation: operations.biblio
      });
    });
  }

  return {
    requests,
    reservationsPhysical,
    reservationsDigital,
    reservationsBiblio
  };
};

export default {};
