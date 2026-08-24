import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import BasicDetailsSection from "../../apps/patron-page/sections/BasicDetailsSection";
import { PatronV5 } from "../../core/fbs/model";

/**
 * The identifier a user can hand to support.
 *
 * Publizon calls it a friendly card number, Biblio a support id. They serve
 * the same purpose, so the section takes a plain string and the caller picks
 * the provider - the presentation must not know which service answered.
 */

vi.mock("../../core/utils/text", () => ({
  useText: () => (key: string) =>
    key === "patronPageBasicFriendlyCardNumberLabelText"
      ? "Support number"
      : key
}));

const patron = {
  name: "Test Låner",
  address: {
    coName: "",
    street: "Eksempelvej 1",
    postalCode: "8000",
    city: "Aarhus",
    country: "DK"
  },
  emailAddress: "test@example.com",
  phoneNumber: "12345678"
} as unknown as PatronV5;

describe("BasicDetailsSection support identifier", () => {
  it("Shows the identifier it is given, whichever service it came from", () => {
    const { container } = render(
      <BasicDetailsSection patron={patron} patronCardNumber="SUP-12345" />
    );

    expect(container.textContent).toContain("Support number");
    expect(container.textContent).toContain("SUP-12345");
  });

  it.each([null, ""])(
    "Leaves out the label when the identifier is %o",
    (patronCardNumber) => {
      const { container } = render(
        <BasicDetailsSection
          patron={patron}
          patronCardNumber={patronCardNumber}
        />
      );

      // Rendering an empty label would suggest the number failed to load.
      expect(container.textContent).not.toContain("Support number");
    }
  );
});
