import { describe, expect, it } from "vitest";
import { canSubmitOpenOrderReservation } from "../../components/reservation/helper";
import { Patron } from "../../core/utils/types/entities";

const patronWithEmail = {
  emailAddress: "user@example.com"
} as Patron;

const patronWithoutEmail = {
  emailAddress: ""
} as Patron;

describe("canSubmitOpenOrderReservation", () => {
  it("blocks submit when the patron has no email", () => {
    expect(
      canSubmitOpenOrderReservation({
        materialIsReservableFromAnotherLibrary: true,
        patron: patronWithoutEmail
      })
    ).toBe(false);
  });

  it("blocks submit when emailAddress is undefined", () => {
    expect(
      canSubmitOpenOrderReservation({
        materialIsReservableFromAnotherLibrary: true,
        patron: {} as Patron
      })
    ).toBe(false);
  });

  it("blocks submit when the patron is missing", () => {
    expect(
      canSubmitOpenOrderReservation({
        materialIsReservableFromAnotherLibrary: true,
        patron: null
      })
    ).toBe(false);
  });

  it("blocks submit for materials not reservable from another library", () => {
    expect(
      canSubmitOpenOrderReservation({
        materialIsReservableFromAnotherLibrary: false,
        patron: patronWithEmail
      })
    ).toBe(false);
  });

  it("allows submit when the material is interlibrary-loan and the patron has an email", () => {
    expect(
      canSubmitOpenOrderReservation({
        materialIsReservableFromAnotherLibrary: true,
        patron: patronWithEmail
      })
    ).toBe(true);
  });
});
