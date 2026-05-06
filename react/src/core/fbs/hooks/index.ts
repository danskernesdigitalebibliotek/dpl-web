import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseMutationOptions
} from "react-query";
import type {
  Fee,
  GetFeesParams,
  Loan,
  RenewedLoan,
  ReservationDetails,
  ReservationResponse,
  CreateReservationBatch,
  UpdateReservationBatch,
  DeleteReservationsParams,
  AuthenticatedPatronInfo,
  CreatePatronRequest,
  UpdatePatronRequest,
  Availability,
  GetAvailabilityParams,
  HoldingsForBibliographicalRecord,
  GetHoldingsParams
} from "@dpl/service-layer/fbs";
import { getFbsClient } from "./useFbsClient";

// -- Query Keys --

export const fbsQueryKeys = {
  fees: (params: GetFeesParams) => ["fbs", "fees", params],
  loans: () => ["fbs", "loans"],
  reservations: () => ["fbs", "reservations"],
  patronInfo: () => ["fbs", "patronInfo"],
  availability: (params: GetAvailabilityParams) => [
    "fbs",
    "availability",
    params
  ],
  holdings: (params: GetHoldingsParams) => ["fbs", "holdings", params]
};

// -- Fees --

export const useGetFees = (
  params: GetFeesParams,
  options?: { query?: Omit<UseQueryOptions<Fee[]>, "queryKey" | "queryFn"> }
) => {
  const client = getFbsClient();
  return useQuery(
    fbsQueryKeys.fees(params),
    () => client.getFees(params),
    options?.query
  );
};

// -- Loans --

export const useGetLoans = (options?: {
  query?: Omit<UseQueryOptions<Loan[]>, "queryKey" | "queryFn">;
}) => {
  const client = getFbsClient();
  return useQuery(
    fbsQueryKeys.loans(),
    () => client.getLoans(),
    options?.query
  );
};

export const useRenewLoans = (
  options?: UseMutationOptions<RenewedLoan[], unknown, { data: number[] }>
) => {
  const client = getFbsClient();
  return useMutation(
    ({ data }: { data: number[] }) => client.renewLoans(data),
    options
  );
};

// -- Reservations --

export const useGetReservations = (options?: {
  query?: Omit<UseQueryOptions<ReservationDetails[]>, "queryKey" | "queryFn">;
}) => {
  const client = getFbsClient();
  return useQuery(
    fbsQueryKeys.reservations(),
    () => client.getReservations(),
    options?.query
  );
};

export const useAddReservations = (
  options?: UseMutationOptions<
    ReservationResponse,
    unknown,
    { data: CreateReservationBatch }
  >
) => {
  const client = getFbsClient();
  return useMutation(
    ({ data }: { data: CreateReservationBatch }) =>
      client.addReservations(data),
    options
  );
};

export const useUpdateReservations = (
  options?: UseMutationOptions<
    ReservationDetails[],
    unknown,
    { data: UpdateReservationBatch }
  >
) => {
  const client = getFbsClient();
  return useMutation(
    ({ data }: { data: UpdateReservationBatch }) =>
      client.updateReservations(data),
    options
  );
};

export const useDeleteReservations = (
  options?: UseMutationOptions<
    void,
    unknown,
    { params: DeleteReservationsParams }
  >
) => {
  const client = getFbsClient();
  return useMutation(
    ({ params }: { params: DeleteReservationsParams }) =>
      client.deleteReservations(params),
    options
  );
};

// -- Patron --

export const useGetPatronInfo = (options?: { enabled?: boolean }) => {
  const client = getFbsClient();
  return useQuery(fbsQueryKeys.patronInfo(), () => client.getPatronInfo(), {
    enabled: options?.enabled
  });
};

export const useCreatePatron = (
  options?: UseMutationOptions<
    AuthenticatedPatronInfo,
    unknown,
    { data: CreatePatronRequest }
  >
) => {
  const client = getFbsClient();
  return useMutation(
    ({ data }: { data: CreatePatronRequest }) => client.createPatron(data),
    options
  );
};

export const useUpdatePatron = (
  options?: UseMutationOptions<void, unknown, { data: UpdatePatronRequest }>
) => {
  const client = getFbsClient();
  return useMutation(
    ({ data }: { data: UpdatePatronRequest }) => client.updatePatron(data),
    options
  );
};

// -- Availability --

export const useGetAvailability = (
  params: GetAvailabilityParams,
  options?: {
    query?: Omit<UseQueryOptions<Availability[]>, "queryKey" | "queryFn">;
  }
) => {
  const client = getFbsClient();
  return useQuery(
    fbsQueryKeys.availability(params),
    () => client.getAvailability(params),
    options?.query
  );
};

export const getAvailability = (params: GetAvailabilityParams) => {
  const client = getFbsClient();
  return client.getAvailability(params);
};

// -- Holdings --

export const useGetHoldings = (
  params: GetHoldingsParams,
  options?: {
    query?: Omit<
      UseQueryOptions<HoldingsForBibliographicalRecord[]>,
      "queryKey" | "queryFn"
    >;
  }
) => {
  const client = getFbsClient();
  return useQuery(
    fbsQueryKeys.holdings(params),
    () => client.getHoldings(params),
    options?.query
  );
};

export const getHoldings = (params: GetHoldingsParams) => {
  const client = getFbsClient();
  return client.getHoldings(params);
};
