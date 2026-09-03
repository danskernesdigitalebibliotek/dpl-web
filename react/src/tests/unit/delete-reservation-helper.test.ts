import { describe, expect, it, vi } from "vitest";
import { getReservationsToDelete } from "../../apps/reservation-list/modal/delete-reservation/helper";
import { ReservationType } from "../../core/utils/types/reservation-type";

const physicalReservation: ReservationType = {
  faust: "12345678",
  reservationIds: [111, 222],
  identifier: null
};

const publizonReservation: ReservationType = {
  faust: null,
  identifier: "9788771076940"
};

const biblioReservation: ReservationType = {
  faust: null,
  identifier: "9788727319346",
  biblioReservationId: "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11"
};

describe("getReservationsToDelete", () => {
  it("Splits reservations by the service that has to cancel them", () => {
    const result = getReservationsToDelete([
      physicalReservation,
      publizonReservation,
      biblioReservation
    ]);

    expect(result.physical).toEqual([111, 222]);
    expect(result.digital).toEqual(["9788771076940"]);
    expect(result.biblio).toEqual(["e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11"]);
  });

  it("Keeps a Biblio reservation out of the Publizon list even though it has an identifier", () => {
    const result = getReservationsToDelete([biblioReservation]);

    // Both providers carry a material identifier, so cancelling a Biblio
    // reservation through Publizon would silently target the wrong service.
    expect(result.digital).toEqual([]);
    // And Biblio cancels by its own id, never by that identifier.
    expect(result.biblio).toEqual(["e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11"]);
  });

  it("Returns empty lists when there is nothing to delete", () => {
    expect(getReservationsToDelete([])).toEqual({
      physical: [],
      digital: [],
      biblio: []
    });
  });
});

describe("requestsAndReservations", () => {
  it("Builds one request per reservation, each with its own service", async () => {
    const { requestsAndReservations } =
      await import("../../apps/reservation-list/modal/delete-reservation/helper");
    const physical = vi.fn();
    const digital = vi.fn();
    const biblio = vi.fn();

    const { requests } = requestsAndReservations({
      reservations: [
        physicalReservation,
        publizonReservation,
        biblioReservation
      ],
      operations: { physical, digital, biblio }
    });

    expect(requests).toHaveLength(3);
    // Physical reservations are cancelled in one batched request.
    expect(requests[0]).toEqual({
      params: { params: { reservationid: [111, 222] } },
      operation: physical
    });
    expect(requests[1]).toEqual({
      params: { identifier: "9788771076940" },
      operation: digital
    });
    // Biblio takes the reservation id directly rather than an object.
    expect(requests[2]).toEqual({
      params: "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11",
      operation: biblio
    });
  });
});
