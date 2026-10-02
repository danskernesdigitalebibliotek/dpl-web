import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

/**
 * A Unilogin student is logged in to the CMS without being a patron. The
 * header shows the student's uni-id, and the menu offers to log out - the
 * patron menu needs a user token the student does not have.
 */

const open = vi.fn();

vi.mock("../../core/utils/text", () => ({
  useText: () => (key: string) => key
}));

vi.mock("../../core/utils/modal", () => ({
  useModalButtonHandler: () => ({ open })
}));

vi.mock("../../core/utils/helpers/modal-helpers", () => ({
  getModalIds: () => ({
    userMenuAuthenticated: "menu-authenticated",
    userMenuAnonymous: "menu-anonymous",
    userMenuUnregistered: "menu-unregistered"
  })
}));

vi.mock("../../core/utils/helpers/usePatronData", () => ({
  usePatronData: () => ({ isLoading: false, data: undefined })
}));

vi.mock("../../apps/menu/menu-logged-in/menu-logged-in", () => ({
  default: () => null
}));
vi.mock(
  "../../apps/menu/menu-user-unregistered/menu-user-unregistered",
  () => ({
    default: () => null
  })
);
vi.mock("../../apps/menu/menu-not-logged-in/menu-not-logged-in", () => ({
  default: () => null
}));

// Module state lives in the token and Unilogin stores, so every test starts
// from a fresh copy - as a fresh page load does.
const loadModules = async () => ({
  token: await import("../../core/token"),
  uniloginUser: await import("../../core/unilogin-user"),
  Menu: (await import("../../apps/menu/menu")).default
});

describe("the header menu", () => {
  beforeEach(() => {
    vi.resetModules();
    open.mockClear();
  });

  afterEach(cleanup);

  it("shows a Unilogin student's uni-id and offers to log out", async () => {
    const { token, uniloginUser, Menu } = await loadModules();
    token.setToken(token.TOKEN_LIBRARY_KEY, "library-token");
    uniloginUser.setUniloginUserId("elev4821");

    render(<Menu pageSize={10} />);
    const button = screen.getByRole("button");

    expect(button.textContent).toContain("elev4821");
    expect(button.getAttribute("aria-label")).toBe("menuUserIconAriaLabelText");

    fireEvent.mouseUp(button);
    // The logout-only menu, as for an unregistered patron.
    expect(open).toHaveBeenCalledWith("menu-unregistered", {
      updateUrl: false
    });
  });

  // Guards against the test above passing for the wrong reason.
  it("offers login to an anonymous visitor", async () => {
    const { token, Menu } = await loadModules();
    token.setToken(token.TOKEN_LIBRARY_KEY, "library-token");

    render(<Menu pageSize={10} />);
    const button = screen.getByRole("button");

    expect(button.textContent).toContain("searchHeaderLoginText");
    expect(button.getAttribute("aria-label")).toBe(
      "menuUserIconAriaLabelLoggedOutText"
    );

    fireEvent.mouseUp(button);
    expect(open).toHaveBeenCalledWith("menu-anonymous", { updateUrl: false });
  });
});
