import { useGetV1UserReservations } from "../publizon/publizon";
import { useDigitalReservations } from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "./useBiblioAdapter";
import {
  mapBiblioReservationToReservationType,
  mapFBSReservationGroupToReservationType,
  mapPublizonReservationToReservationType
} from "./helpers/list-mapper";
import {
  getReadyForPickup,
  sortByPickupNumber,
  sortByNumberInQueue,
  sortByOldestPickupDeadline
} from "../../apps/reservation-list/utils/helpers";
import { ReservationType } from "./types/reservation-type";
import { dashboardReservedApiValueText } from "../configuration/api-strings";
import useGetReservationGroups from "./useGetReservationGroups";

const getQueuedReservations = (list: ReservationType[]) => {
  return [...list].filter(
    ({ state }) => state === dashboardReservedApiValueText
  );
};

type Reservations = {
  reservations: ReservationType[];
  readyToLoan: ReservationType[];
  queued: ReservationType[];
  isLoading: boolean;
  isError: boolean;
};

type UseReservationsType = {
  all: Reservations;
  fbs: Reservations;
  // Digital reservations from both providers. During the transition a
  // reservation made before the switch stays visible while new ones are
  // created through the Biblio adapter.
  digital: Reservations;
};

type UseReservations = () => UseReservationsType;

const useReservations: UseReservations = () => {
  const useBiblio = useBiblioAdapter();
  const {
    data: reservationsFbs,
    isLoading: isLoadingFbs,
    isError: isErrorFbs
  } = useGetReservationGroups();
  const {
    data: reservationsPublizon,
    isLoading: isLoadingPublizonData,
    isError: isErrorPublizonData
  } = useGetV1UserReservations();
  const {
    data: reservationsBiblio,
    isLoading: isLoadingBiblio,
    isError: isErrorBiblio
  } = useDigitalReservations({ enabled: useBiblio });

  // A disabled query is never loading or in error so the Biblio states only
  // count when the feature flag has enabled the query.
  const isLoadingDigital = isLoadingPublizonData || isLoadingBiblio;
  const isErrorDigital = isErrorPublizonData || isErrorBiblio;

  const reservationsIsLoading = isLoadingFbs || isLoadingDigital;
  const reservationsIsError = isErrorFbs || isErrorDigital;

  // map reservations to same type
  const mappedReservationsFbs = reservationsFbs
    ? mapFBSReservationGroupToReservationType(reservationsFbs)
    : [];
  const mappedReservationsBiblio = reservationsBiblio?.reservations
    ? mapBiblioReservationToReservationType(reservationsBiblio.reservations)
    : [];
  const mappedReservationsDigital = [
    ...(reservationsPublizon?.reservations
      ? mapPublizonReservationToReservationType(
          reservationsPublizon.reservations
        )
      : []),
    ...mappedReservationsBiblio
  ];

  // Combine all reservations, physical and digital
  const reservations = [...mappedReservationsFbs, ...mappedReservationsDigital];

  // Combine "ready to loan" reservations, physical and digital
  // Sort by pickup number (alphanumeric) with fallback to pickup deadline
  const reservationsReadyToLoanFBS = sortByPickupNumber(
    getReadyForPickup(mappedReservationsFbs)
  );
  const reservationsReadyToLoanDigital = sortByPickupNumber(
    getReadyForPickup(mappedReservationsDigital)
  );
  const reservationsReadyToLoan = sortByPickupNumber([
    ...reservationsReadyToLoanFBS,
    ...reservationsReadyToLoanDigital
  ]);

  // Combine "still in queue" reservations, physical and digital
  // FBS sorts by queue number, digital by expected redeem date (pickupDeadline)
  const reservationsQueuedFBS = sortByNumberInQueue(
    getQueuedReservations(mappedReservationsFbs)
  );
  const reservationsQueuedDigital = sortByOldestPickupDeadline(
    getQueuedReservations(mappedReservationsDigital)
  ) as ReservationType[];
  const reservationsQueued = [
    ...reservationsQueuedFBS,
    ...reservationsQueuedDigital
  ];

  return {
    all: {
      reservations,
      readyToLoan: reservationsReadyToLoan,
      queued: reservationsQueued,
      isLoading: reservationsIsLoading,
      isError: reservationsIsError
    },
    fbs: {
      reservations: mappedReservationsFbs,
      readyToLoan: reservationsReadyToLoanFBS,
      queued: reservationsQueuedFBS,
      isLoading: isLoadingFbs,
      isError: isErrorFbs
    },
    digital: {
      reservations: mappedReservationsDigital,
      readyToLoan: reservationsReadyToLoanDigital,
      queued: reservationsQueuedDigital,
      isLoading: isLoadingDigital,
      isError: isErrorDigital
    }
  };
};

export default useReservations;
