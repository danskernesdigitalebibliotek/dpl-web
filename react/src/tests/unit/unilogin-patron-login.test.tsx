import React, { useSyncExternalStore } from "react";
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

// Whether the question is open, as the modal store would say. Anything on the
// page can close it, e.g. Escape, so the tests change it directly too.
const modal = vi.hoisted(() => {
  let isOpen = false;
  const listeners = new Set<() => void>();
  return {
    isOpen: () => isOpen,
    set: (value: boolean) => {
      isOpen = value;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
});

vi.mock("../../core/utils/modal", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useIsModalOpen: () => useSyncExternalStore(modal.subscribe, modal.isOpen),
  useModalButtonHandler: () => ({
    open: (...args: unknown[]) => {
      open(...args);
      modal.set(true);
    },
    close: (...args: unknown[]) => {
      close(...args);
      modal.set(false);
    }
  })
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
    modal.set(false);
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

  it("is not there for a visitor who is not a Unilogin student", async () => {
    const { MenuUniloginPatronLogin } = await loadModules();
    render(<MenuUniloginPatronLogin />);

    expect(screen.queryByText("uniloginPatronLoginHeadingText")).toBeNull();
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
    expect(dispatch).not.toHaveBeenCalled();
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

  it("drops the started action when the question is closed another way, e.g. with Escape", async () => {
    const { uniloginUser, guardedRequests, MenuUniloginPatronLogin } =
      await loadModules();
    config.values.uniloginUserIdConfig = "elev4821";
    render(<MenuUniloginPatronLogin />);
    const proceed = vi.fn();

    act(() => uniloginUser.requestPatronLogin(proceed));
    expect(open).toHaveBeenCalled();
    act(() => modal.set(false));

    expect(proceed).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(guardedRequests.removeRequest());
  });
});
