import { beforeAll, describe, expect, it } from "vitest";
import {
  type DigitalLoan,
  type DigitalMaterial,
  type DigitalReservation
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import {
  mapDigitalLoanToLoanType,
  mapDigitalMaterialToBasicDetailsType,
  mapDigitalReservationToReservationType
} from "../../core/utils/helpers/list-mapper";
import { store } from "../../core/store";
import { addTextEntries } from "../../core/text.slice";

/**
 * The Biblio adapter DTOs are mapped onto the same types as Publizon and FBS
 * so every list component can treat all providers alike. These tests pin the
 * translation, including the places where Biblio and Publizon disagree.
 */

const digitalLoan: DigitalLoan = {
  loanId: "3f7b1c62-9d4e-4a71-b0c3-1d5a8e2f4b90",
  materialId: "9788727319346",
  materialType: "ebook",
  startDate: "2022-10-19T08:15:00.000Z",
  endDate: "2022-11-16T08:15:00.000Z",
  active: true,
  title: "Din for en sommer",
  author: "Sherman, L.",
  publisher: "Lindhardt og Ringhof",
  publishDate: "2022-06-18T00:00:00.000Z",
  loanProvider: "selection"
};

const digitalReservation: DigitalReservation = {
  reservationId: "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11",
  materialId: "9788727319346",
  materialType: "ebook",
  createdDate: "2022-10-19T06:32:30.000Z",
  expectedLoanDate: "2022-11-10T06:32:30.000Z"
};

describe("Biblio list mappers", () => {
  beforeAll(() => {
    // The mappers read material type labels straight from the text store.
    store.dispatch(
      addTextEntries({
        entries: {
          publizonEbookText: "E-book",
          publizonAudioBookText: "Audiobook",
          materialByAuthorText: "By",
          materialAndAuthorText: "and"
        }
      })
    );
  });

  describe("mapDigitalLoanToLoanType", () => {
    it("Uses the Biblio loan id as the order id, which opens the reader", () => {
      const [loan] = mapDigitalLoanToLoanType([digitalLoan]);

      // Publizon's orderId is the key the reader/player is opened with, so
      // the Biblio loan id has to take that role.
      expect(loan.orderId).toBe(digitalLoan.loanId);
      // A digital loan has no FBS loan id or faust number.
      expect(loan.loanId).toBeNull();
      expect(loan.faust).toBeNull();
    });

    it("Maps the loan period and identifier", () => {
      const [loan] = mapDigitalLoanToLoanType([digitalLoan]);

      expect(loan.loanDate).toBe(digitalLoan.startDate);
      expect(loan.dueDate).toBe(digitalLoan.endDate);
      expect(loan.identifier).toBe(digitalLoan.materialId);
      expect(loan.materialItemNumber).toBe(digitalLoan.materialId);
    });

    it("Cannot be renewed", () => {
      const [loan] = mapDigitalLoanToLoanType([digitalLoan]);

      expect(loan.isRenewable).toBe(false);
      expect(loan.renewalStatusList).toEqual([]);
    });

    it("Carries its own details, so the list needs no metadata lookup", () => {
      const [loan] = mapDigitalLoanToLoanType([digitalLoan]);

      expect(loan.details?.title).toBe("Din for en sommer");
      expect(loan.details?.year).toBe(2022);
      expect(loan.details?.materialType).toBe("E-book");
      expect(loan.details?.externalProductId).toBe(digitalLoan.materialId);
      // A loan states its author as one string; the formatter still applies.
      expect(loan.details?.authors).toContain("Sherman, L.");
    });

    it("Labels an audiobook as such", () => {
      const [loan] = mapDigitalLoanToLoanType([
        { ...digitalLoan, materialType: "audiobook" }
      ]);

      expect(loan.details?.materialType).toBe("Audiobook");
    });
  });

  describe("mapDigitalReservationToReservationType", () => {
    it("Counts a reservation without an offer as still queued", () => {
      const [reservation] = mapDigitalReservationToReservationType([
        digitalReservation
      ]);

      expect(reservation.state).toBe("reserved");
      // Nothing expires until there is an offer.
      expect(reservation.expiryDate).toBeNull();
    });

    it("Counts an offered reservation as ready for pickup", () => {
      const [reservation] = mapDigitalReservationToReservationType([
        {
          ...digitalReservation,
          offerId: "9a1c7f30-4d62-4e18-b5a7-2c8e6f0b3d94",
          offerExpiresAt: "2022-10-24T06:32:30.000Z"
        }
      ]);

      expect(reservation.state).toBe("readyForPickup");
      // It is the offer that expires, not the reservation.
      expect(reservation.expiryDate).toBe("2022-10-24T06:32:30.000Z");
    });

    it("Keeps the adapter's own reservation id, which is what cancels it", () => {
      const [reservation] = mapDigitalReservationToReservationType([
        digitalReservation
      ]);

      // Publizon cancels by material identifier, Biblio by reservation id -
      // both are carried so the delete flow can tell them apart.
      expect(reservation.digitalReservationId).toBe(
        digitalReservation.reservationId
      );
      expect(reservation.identifier).toBe(digitalReservation.materialId);
    });

    it("Maps the dates and leaves the title to the metadata lookup", () => {
      const [reservation] = mapDigitalReservationToReservationType([
        digitalReservation
      ]);

      expect(reservation.dateOfReservation).toBe(
        digitalReservation.createdDate
      );
      expect(reservation.pickupDeadline).toBe(
        digitalReservation.expectedLoanDate
      );
      // A reservation carries no title, unlike a loan.
      expect(reservation.title).toBeNull();
    });
  });

  describe("mapDigitalMaterialToBasicDetailsType", () => {
    const material: DigitalMaterial = {
      isbn: "9788727319346",
      materialType: "audiobook",
      title: "Terræn",
      authors: ["Rugaard, Ida"],
      description: "En intens romance",
      publishDate: "2021-03-04T00:00:00.000Z",
      languages: ["dan"]
    };

    it("Maps the catalogue fields used to present a material", () => {
      const details = mapDigitalMaterialToBasicDetailsType(material);

      expect(details.title).toBe("Terræn");
      expect(details.year).toBe(2021);
      expect(details.description).toBe("En intens romance");
      expect(details.lang).toBe("dan");
      expect(details.materialType).toBe("Audiobook");
      expect(details.externalProductId).toBe(material.isbn);
      expect(details.authors).toContain("Rugaard, Ida");
    });

    it("Leaves the authors empty when the material has none", () => {
      // The one catalogue field the contract does not require.
      const details = mapDigitalMaterialToBasicDetailsType({
        ...material,
        authors: []
      });

      expect(details.authors).toBeUndefined();
    });
  });
});
