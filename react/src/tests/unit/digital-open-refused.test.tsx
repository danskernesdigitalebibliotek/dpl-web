import React, { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import DigitalReaderPlayer from "../../components/reader-player/DigitalReaderPlayer";
import useDigitalCheckout from "../../components/reader-player/useDigitalCheckout";
import { store } from "../../core/store";
import { addTextEntries } from "../../core/text.slice";
import digitalSessionArgs from "../../core/storybook/digitalSessionArgs";

/**
 * The SDK can refuse to open a loan and mount nothing. A full device list is
 * the refusal a patron can do something about: they are shown their devices,
 * remove one, and the loan is opened again. Any other refusal gets a message
 * rather than a blank page.
 */

// The reader is reduced to what matters here: it refuses once with the code
// under test and then opens, so a second mount is a successful retry.
const refuseWith = vi.fn<() => { reason: string } | null>();
const readerMounts = vi.fn();

type ReaderProps = {
  onStop: (reason: unknown) => void;
};

const ReaderStub = ({ onStop }: ReaderProps) => {
  useEffect(() => {
    readerMounts();
    const refusal = refuseWith();
    if (refusal) onStop(refusal);
  }, [onStop]);
  return <div data-testid="reader" />;
};

vi.mock("../../components/reader-player/DigitalReader", () => ({
  default: (props: ReaderProps) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ReaderStub {...props} />
  )
}));
vi.mock("../../components/reader-player/useDigitalCheckout", () => ({
  default: vi.fn()
}));

const removeDevice = vi.fn<(id: string) => Promise<boolean>>();
vi.mock("@danskernesdigitalebibliotek/dpl-wedobooks", () => ({
  WedoBooksDeviceSession: ({
    children
  }: {
    children: (
      devices: unknown,
      remove: (id: string) => Promise<boolean>,
      removing: boolean
    ) => React.ReactNode;
  }) =>
    children(
      {
        devices: [
          {
            id: "device-1",
            name: "Chrome on macOS",
            lastUsed: "2026-09-30T10:00:00.000Z"
          }
        ],
        limit: 1
      },
      removeDevice,
      false
    )
}));

const renderReaderPage = () => {
  vi.mocked(useDigitalCheckout).mockReturnValue({
    sdk: {},
    checkout: { material_type: "ebook" }
  } as unknown as ReturnType<typeof useDigitalCheckout>);
  store.dispatch(addTextEntries({ entries: digitalSessionArgs }));

  return render(
    <Provider store={store}>
      <DigitalReaderPlayer loanId="loan-1" onClose={() => {}} />
    </Provider>
  );
};

describe("A loan the SDK refuses to open", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("lists the patron's devices when there is no room for this one", async () => {
    refuseWith.mockReturnValueOnce({ reason: "device_limit_reached" });

    const { findByText, queryByTestId } = renderReaderPage();

    expect(
      await findByText(/up to 1 devices, and they are all in use/)
    ).not.toBeNull();
    expect(await findByText("Chrome on macOS")).not.toBeNull();
    expect(queryByTestId("reader")).toBeNull();
  });

  it("opens the loan again once a device has been removed", async () => {
    refuseWith.mockReturnValueOnce({ reason: "device_limit_reached" });
    removeDevice.mockResolvedValue(true);

    const { findByText, findByTestId } = renderReaderPage();
    // Button acts on mouse up, not click.
    fireEvent.mouseUp(await findByText("Remove"));

    expect(removeDevice).toHaveBeenCalledWith("device-1");
    expect(await findByTestId("reader")).not.toBeNull();
    expect(readerMounts).toHaveBeenCalledTimes(2);
  });

  it("says so when the refusal is one this page cannot act on", async () => {
    refuseWith.mockReturnValueOnce({ reason: "open_failed" });

    const { findByText, queryByTestId } = renderReaderPage();

    expect(
      await findByText("The title could not be opened. Try again later.")
    ).not.toBeNull();
    expect(queryByTestId("reader")).toBeNull();
  });

  it("says the loan expired when the SDK closed the title for that", async () => {
    refuseWith.mockReturnValueOnce({ reason: "access_expired" });

    const { findByText, queryByText, queryByTestId } = renderReaderPage();

    expect(
      await findByText("Your loan of this title has expired, so it was closed.")
    ).not.toBeNull();
    expect(queryByText("Open again")).toBeNull();
    expect(queryByTestId("reader")).toBeNull();
  });

  it("offers to open again when this device was removed from the account", async () => {
    refuseWith.mockReturnValueOnce({ reason: "device_revoked" });

    const { findByText, findByTestId } = renderReaderPage();
    fireEvent.mouseUp(await findByText("Open again"));

    expect(await findByTestId("reader")).not.toBeNull();
    expect(readerMounts).toHaveBeenCalledTimes(2);
  });
});
