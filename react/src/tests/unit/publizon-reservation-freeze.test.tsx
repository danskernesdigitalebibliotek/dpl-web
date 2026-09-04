import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import usePublizonReaderPlayerState from "../../core/utils/usePublizonReaderPlayerState";
import useCanCancelReservation from "../../core/utils/useCanCancelReservation";
import usePublizonReservationsClosed from "../../core/utils/usePublizonReservationsClosed";
import {
  useGetV1LoanstatusIdentifier,
  useGetV1UserLoans,
  useGetV1UserReservations
} from "../../core/publizon/publizon";
import { isAnonymous } from "../../core/utils/helpers/user";
import { ReservationType } from "../../core/utils/types/reservation-type";

/**
 * TEMPORARY: the Publizon reservation queue standing still while Biblio
 * migrates it.
 *
 * Getting this wrong is expensive in both directions: a reservation made or
 * cancelled after the queue has been copied is simply lost, while freezing
 * more than the queue would stop a library from lending at all. So the tests
 * pin both halves - what the freeze closes, and what it must leave alone.
 */

vi.mock("../../core/publizon/publizon", () => ({
  useGetV1LoanstatusIdentifier: vi.fn(),
  useGetV1UserLoans: vi.fn(),
  useGetV1UserReservations: vi.fn()
}));
vi.mock("../../core/utils/helpers/user", () => ({ isAnonymous: vi.fn() }));
vi.mock("../../core/utils/usePublizonReservationsClosed", () => ({
  default: vi.fn()
}));

const IDENTIFIER = "9788727319346";
const RESERVATION_ID = "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11";

// Publizon answers the whole loan decision with one status code: 4 is
// loanable, 5 is "on loan, but you may join the queue".
const LOANABLE = 4;
const RESERVABLE = 5;

const givenTheQueueIsFrozen = (frozen: boolean) =>
  vi.mocked(usePublizonReservationsClosed).mockReturnValue(frozen);

// The reservation decision needs Publizon's answer as well as the flag.
const given = ({
  frozen,
  loanStatus
}: {
  frozen: boolean;
  loanStatus: number;
}) => {
  givenTheQueueIsFrozen(frozen);
  vi.mocked(isAnonymous).mockReturnValue(false);
  vi.mocked(useGetV1LoanstatusIdentifier).mockReturnValue({
    data: { loanStatus },
    isLoading: false
  } as never);
  vi.mocked(useGetV1UserLoans).mockReturnValue({
    data: { loans: [] },
    isLoading: false
  } as never);
  vi.mocked(useGetV1UserReservations).mockReturnValue({
    data: { reservations: [] },
    isLoading: false
  } as never);
};

const renderState = () =>
  renderHook(() =>
    usePublizonReaderPlayerState({
      identifier: IDENTIFIER,
      canAcquire: true
    })
  ).result.current;

const publizonReservation: ReservationType = { identifier: IDENTIFIER };
const biblioReservation: ReservationType = {
  identifier: IDENTIFIER,
  digitalReservationId: RESERVATION_ID
};
const physicalReservation: ReservationType = {
  faust: "12345678",
  reservationIds: [1234]
};

describe("The Publizon reservation freeze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("making a reservation", () => {
    it("Refuses a reservation Publizon would have taken, and says why", () => {
      given({ frozen: true, loanStatus: RESERVABLE });

      expect(renderState()).toMatchObject({
        canBeReserved: false,
        reservationsClosed: true
      });
    });

    it("Takes the reservation as usual outside the freeze", () => {
      given({ frozen: false, loanStatus: RESERVABLE });

      expect(renderState()).toMatchObject({
        canBeReserved: true,
        reservationsClosed: false
      });
    });

    it("Keeps lending an available material during the freeze", () => {
      // Only the queue is being migrated. A library that cannot lend either
      // has been shut down rather than frozen. reservationsClosed stays false
      // too: no reservation was on offer to refuse, so there is nothing to
      // explain.
      given({ frozen: true, loanStatus: LOANABLE });

      expect(renderState()).toMatchObject({
        canBeLoaned: true,
        reservationsClosed: false
      });
    });
  });

  describe("cancelling a reservation", () => {
    const renderCanCancel = () =>
      renderHook(() => useCanCancelReservation()).result.current;

    it("Holds on to the Publizon reservations being migrated", () => {
      givenTheQueueIsFrozen(true);

      expect(renderCanCancel()(publizonReservation)).toBe(false);
    });

    it("Leaves the reservations Biblio holds alone", () => {
      // Biblio's own queue is what the freeze exists to fill, so nothing about
      // it stands still.
      givenTheQueueIsFrozen(true);

      expect(renderCanCancel()(biblioReservation)).toBe(true);
    });

    it("Leaves physical reservations alone", () => {
      givenTheQueueIsFrozen(true);

      expect(renderCanCancel()(physicalReservation)).toBe(true);
    });

    it("Cancels as usual outside the freeze", () => {
      givenTheQueueIsFrozen(false);

      expect(renderCanCancel()(publizonReservation)).toBe(true);
    });
  });
});
