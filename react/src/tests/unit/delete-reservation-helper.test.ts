import { describe, expect, it, vi } from "vitest";
import { getReservationsToDelete } from "../../apps/reservation-list/modal/delete-reservation/helper";
import { deleteReservationModalId } from "../../apps/reservation-list/modal/delete-reservation/delete-reservation-modal";
import { getModalIds } from "../../core/utils/helpers/modal-helpers";
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

const serviceLayerReservation: ReservationType = {
  faust: null,
  identifier: "9788727319346",
  digitalReservationId: "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11"
};

describe("getReservationsToDelete", () => {
  it("Splits reservations by the service that has to cancel them", () => {
    const result = getReservationsToDelete([
      physicalReservation,
      publizonReservation,
      serviceLayerReservation
    ]);

    expect(result.physical).toEqual([111, 222]);
    expect(result.publizon).toEqual(["9788771076940"]);
    expect(result.digital).toEqual(["e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11"]);
  });

  it("Keeps a service layer reservation out of the Publizon list even though it has an identifier", () => {
    const result = getReservationsToDelete([serviceLayerReservation]);

    // Both providers carry a material identifier, so cancelling through
    // Publizon would silently target the wrong service.
    expect(result.publizon).toEqual([]);
    // The service layer cancels by the reservation's own id, never by that
    // identifier.
    expect(result.digital).toEqual(["e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11"]);
  });

  it("Returns empty lists when there is nothing to delete", () => {
    expect(getReservationsToDelete([])).toEqual({
      physical: [],
      publizon: [],
      digital: []
    });
  });
});

describe("requestsAndReservations", () => {
  it("Builds one request per reservation, each with its own service", async () => {
    const { requestsAndReservations } =
      await import("../../apps/reservation-list/modal/delete-reservation/helper");
    const physical = vi.fn();
    const publizon = vi.fn();
    const digital = vi.fn();

    const { requests } = requestsAndReservations({
      reservations: [
        physicalReservation,
        publizonReservation,
        serviceLayerReservation
      ],
      operations: { physical, publizon, digital }
    });

    expect(requests).toHaveLength(3);
    // Physical reservations are cancelled in one batched request.
    expect(requests[0]).toEqual({
      params: { params: { reservationid: [111, 222] } },
      operation: physical
    });
    expect(requests[1]).toEqual({
      params: { identifier: "9788771076940" },
      operation: publizon
    });
    // The service layer takes the reservation id directly rather than an
    // object.
    expect(requests[2]).toEqual({
      params: "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11",
      operation: digital
    });
  });
});

describe("deleteReservationModalId", () => {
  it("carries the configured prefix", () => {
    // Reading a key the configuration does not have leaves the literal
    // "undefined" in every id, and the query parameter that restores the modal
    // then matches nothing.
    expect(deleteReservationModalId(physicalReservation)).toBe(
      `${getModalIds().deleteReservation}111`
    );
    expect(deleteReservationModalId(physicalReservation)).toBe(
      "delete-reservation111"
    );
  });

  it("identifies a digital reservation by its identifier", () => {
    expect(deleteReservationModalId(publizonReservation)).toBe(
      "delete-reservation9788771076940"
    );
  });
});
