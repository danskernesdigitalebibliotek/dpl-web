import { describe, expect, it } from "vitest";
import { getDetailsModalId } from "../../core/utils/helpers/modal-helpers";

describe("getDetailsModalId", () => {
  it("reads a short physical reservation id", () => {
    // FBS reservation ids are plain counters, so most of them are short.
    expect(
      getDetailsModalId("delete-reservation111", "delete-reservation")
    ).toBe("111");
  });

  it("reads a faust id", () => {
    expect(getDetailsModalId("loan-details-12345678", "loan-details-")).toBe(
      "12345678"
    );
    expect(getDetailsModalId("loan-details-956442399", "loan-details-")).toBe(
      "956442399"
    );
  });

  it("reads a digital identifier", () => {
    expect(
      getDetailsModalId(
        "reservation-details-9788771076940",
        "reservation-details-"
      )
    ).toBe("9788771076940");
  });

  it("answers with nothing when no id follows the prefix", () => {
    expect(getDetailsModalId("delete-reservations", "delete-reservation")).toBe(
      ""
    );
    expect(getDetailsModalId("some-other-modal", "delete-reservation")).toBe(
      ""
    );
  });
});
