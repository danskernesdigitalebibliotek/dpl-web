import { describe, expect, it } from "vitest";
import {
  loanWasCreated,
  publizonReservationContact,
  resolveLoanReservationRequest
} from "../../core/utils/helpers/digital-loan-request";
import { Patron } from "../../core/utils/types/entities";

const material = {
  openModal: false,
  canBeLoaned: false,
  canBeReserved: false,
  identifier: "material-1",
  offerId: null
};

describe("resolveLoanReservationRequest", () => {
  it("only opens the modal when that is what the button is for", () => {
    // Even a material that could be borrowed right away: the press belongs to
    // the material page's button, which confirms before it acts.
    expect(
      resolveLoanReservationRequest({
        ...material,
        openModal: true,
        canBeLoaned: true
      })
    ).toEqual({ kind: "open-modal" });
  });

  it("borrows a material that can be borrowed", () => {
    expect(
      resolveLoanReservationRequest({ ...material, canBeLoaned: true })
    ).toEqual({ kind: "loan", materialId: "material-1" });
  });

  it("redeems an offer rather than borrowing the material anew", () => {
    expect(
      resolveLoanReservationRequest({
        ...material,
        canBeLoaned: true,
        offerId: "offer-1"
      })
    ).toEqual({ kind: "accept-offer", offerId: "offer-1" });
  });

  it("prefers the loan when the material can be both borrowed and reserved", () => {
    expect(
      resolveLoanReservationRequest({
        ...material,
        canBeLoaned: true,
        canBeReserved: true
      })
    ).toEqual({ kind: "loan", materialId: "material-1" });
  });

  it("reserves a material that can only be queued for", () => {
    expect(
      resolveLoanReservationRequest({ ...material, canBeReserved: true })
    ).toEqual({ kind: "reserve", materialId: "material-1" });
  });

  it("answers nothing for a material that can neither be borrowed nor reserved", () => {
    expect(resolveLoanReservationRequest(material)).toBeNull();
  });

  it("answers nothing without an identifier to act on", () => {
    expect(
      resolveLoanReservationRequest({
        ...material,
        canBeLoaned: true,
        identifier: null
      })
    ).toBeNull();
  });
});

describe("loanWasCreated", () => {
  const decision = { status: "loanable" } as const;

  it("recognises a request that produced a loan", () => {
    const loan = { loanId: "loan-1" } as never;
    expect(loanWasCreated({ ...decision, loan })).toBe(true);
  });

  it("refuses a request the adapter accepted without acting on", () => {
    // The adapter answers 200 with a decision when it declines, so the
    // envelope rather than the status code decides.
    expect(loanWasCreated({ ...decision, loan: undefined })).toBe(false);
  });
});

describe("publizonReservationContact", () => {
  it("passes on both ways of reaching the user", () => {
    expect(
      publizonReservationContact({
        emailAddress: "reader@example.com",
        phoneNumber: "12345678"
      } as Patron)
    ).toEqual({ email: "reader@example.com", phoneNumber: "+4512345678" });
  });

  it("leaves a number that already carries a country code alone", () => {
    expect(
      publizonReservationContact({ phoneNumber: "+4712345678" } as Patron)
    ).toEqual({ phoneNumber: "+4712345678" });
  });

  it("sends no empty fields for a patron who left them blank", () => {
    expect(
      publizonReservationContact({
        emailAddress: "",
        phoneNumber: ""
      } as Patron)
    ).toEqual({});
  });
});
