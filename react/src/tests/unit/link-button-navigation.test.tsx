import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LinkButton from "../../components/Buttons/LinkButton";
import * as urlHelpers from "../../core/utils/helpers/url";

/**
 * A link rendered as a button navigates every time it is clicked.
 *
 * `Button` can be asked to spend itself on the first click, which only the
 * logout button needs: clicking it twice clears the session and then navigates
 * again, landing the user on "you do not have access". `LinkButton` used to ask
 * for the same on every link it rendered, and nothing ever gave the guard back
 * - so a link that had been followed once was dead if its page came back from
 * the back/forward cache. Navigation does not need the guard: the browser
 * serialises it, and the small-size branch of MaterialSecondaryLink has
 * navigated through a plain `Link` without one since January 2025.
 */

const linkButton = (
  <LinkButton
    url={new URL("https://example.com/sample")}
    buttonType="none"
    variant="outline"
    size="large"
    dataCy="teaser"
  >
    Try
  </LinkButton>
);

const renderLinkButton = () => {
  const redirect = vi
    .spyOn(urlHelpers, "redirectTo")
    .mockImplementation(() => {});
  const { rerender } = render(linkButton);

  return {
    redirect,
    button: () => screen.getByRole("button"),
    renderAgain: () => rerender(linkButton)
  };
};

describe("A link rendered as a button", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("Navigates again when it is clicked again", () => {
    const { redirect, button } = renderLinkButton();

    fireEvent.mouseUp(button());
    fireEvent.mouseUp(button());

    expect(redirect).toHaveBeenCalledTimes(2);
  });

  it("Survives a render that happens after it has been followed", () => {
    // A spent button shows itself only on the next render - switching material
    // type, say - which is what made the symptom look unrelated to the click
    // that caused it.
    const { redirect, button, renderAgain } = renderLinkButton();

    fireEvent.mouseUp(button());
    renderAgain();

    expect(button()).toHaveProperty("disabled", false);
    fireEvent.mouseUp(button());
    expect(redirect).toHaveBeenCalledTimes(2);
  });
});
