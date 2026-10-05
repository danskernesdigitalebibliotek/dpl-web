import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen
} from "@testing-library/react";

/**
 * A Unilogin student who starts something that needs a patron login - a
 * reservation, a loan, a favourite - is asked first. Going on logs the
 * student out of Unilogin, so it must never happen behind the student's back.
 */

const open = vi.fn();
const close = vi.fn();
const dispatch = vi.fn();

vi.mock("../../core/utils/text", () => ({
  useText: () => (key: string) => key
}));

// The menu app's config, as the CMS hands it over in data attributes.
const config = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock("../../core/utils/config", () => ({
  useConfig: () => (key: string) => config.values[key] ?? ""
}));

vi.mock("../../core/utils/modal", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useModalButtonHandler: () => ({ open, close })
}));

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-redux")>()),
  useDispatch: () => dispatch
}));

// Module state lives in the Unilogin store, so every test starts from a fresh
// copy - as a fresh page load does.
const loadModules = async () => ({
  uniloginUser: await import("../../core/unilogin-user"),
  guardedRequests: await import("../../core/guardedRequests.slice"),
  MenuUniloginPatronLogin: (
    await import("../../apps/menu/menu-unilogin-patron-login/menu-unilogin-patron-login")
  ).default
});

describe("starting a patron login", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    config.values = {};
  });

  afterEach(cleanup);

  it("goes straight on for a visitor who is not a Unilogin student", async () => {
    const { uniloginUser } = await loadModules();
    const proceed = vi.fn();

    uniloginUser.requestPatronLogin(proceed);

    expect(proceed).toHaveBeenCalled();
  });

  it("goes straight on when the header shows no Unilogin student", async () => {
    const { uniloginUser, MenuUniloginPatronLogin } = await loadModules();
    render(<MenuUniloginPatronLogin />);
    const proceed = vi.fn();

    uniloginUser.requestPatronLogin(proceed);

    expect(proceed).toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it("asks a Unilogin student first, and goes on when the student agrees", async () => {
    const { uniloginUser, MenuUniloginPatronLogin } = await loadModules();
    config.values.uniloginUserIdConfig = "elev4821";
    render(<MenuUniloginPatronLogin />);
    const proceed = vi.fn();

    act(() => uniloginUser.requestPatronLogin(proceed));

    expect(proceed).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith("unilogin-patron-login", {
      updateUrl: false
    });

    fireEvent.mouseUp(screen.getByText("uniloginPatronLoginConfirmText"));
    expect(proceed).toHaveBeenCalled();
  });

  it("drops the started action when the student cancels", async () => {
    const { uniloginUser, guardedRequests, MenuUniloginPatronLogin } =
      await loadModules();
    config.values.uniloginUserIdConfig = "elev4821";
    render(<MenuUniloginPatronLogin />);
    const proceed = vi.fn();

    act(() => uniloginUser.requestPatronLogin(proceed));
    fireEvent.mouseUp(screen.getByText("uniloginPatronLoginCancelText"));

    expect(proceed).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith("unilogin-patron-login");
    // A guarded request stored for after login must not run at a later login.
    expect(dispatch).toHaveBeenCalledWith(guardedRequests.removeRequest());
  });
});
