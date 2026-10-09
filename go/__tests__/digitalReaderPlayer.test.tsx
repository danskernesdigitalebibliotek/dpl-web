import { cleanup, fireEvent, render } from "@testing-library/react"
import React, { useEffect } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import DigitalReaderPlayer from "@/components/shared/digitalReaderPlayer/DigitalReaderPlayer"
import type { DigitalSessionModalProps } from "@/components/shared/digitalSessionModal/DigitalSessionModal"
import { useReaderCheckout } from "@/hooks/useReaderCheckout"

/**
 * The SDK can close the reader on its own (the session moved) or refuse to
 * open it at all (no room for this device). Both are explained in the digital
 * session dialog rather than left as a blank page, and a retry from the dialog
 * opens the loan again.
 */

type ReaderProps = {
  onStop: (reason: unknown) => void
}

// The reader is reduced to what it reports back: whatever `stopWith` says on
// each mount, so a second mount with nothing scripted is a successful retry.
const stopWith = vi.fn<() => unknown>()
const readerMounts = vi.fn()

const ReaderStub = ({ onStop }: ReaderProps) => {
  useEffect(() => {
    readerMounts()
    const reason = stopWith()
    if (reason) onStop(reason)
  }, [onStop])
  return <div data-testid="reader" />
}

vi.mock("@/components/shared/digitalReaderPlayer/DigitalReader", () => ({
  default: (props: ReaderProps) => <ReaderStub {...props} />,
}))
// The dialog itself is radix inside a portal; what matters here is what it is
// told and what its two ways out do.
vi.mock("@/components/shared/digitalSessionModal/DigitalSessionModal", () => ({
  default: ({
    reason,
    onRetry,
    onClose,
  }: DigitalSessionModalProps & { open: boolean; onClose: () => void }) => (
    <div data-testid="session-dialog" data-reason={reason.reason}>
      <button onClick={onRetry}>retry</button>
      <button onClick={onClose}>close</button>
    </div>
  ),
}))
vi.mock("@/hooks/useReaderCheckout", () => ({ useReaderCheckout: vi.fn() }))

describe("DigitalReaderPlayer when the SDK will not show the loan", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  const renderReader = (onClose = vi.fn()) => {
    vi.mocked(useReaderCheckout).mockReturnValue({
      sdk: {},
      checkout: { material_type: "ebook" },
    } as unknown as ReturnType<typeof useReaderCheckout>)
    return { onClose, ...render(<DigitalReaderPlayer loanId="loan-1" onClose={onClose} />) }
  }

  it("explains a refusal for want of room instead of leaving the page blank", () => {
    stopWith.mockReturnValueOnce({ reason: "device_limit_reached" })

    const { onClose, getByTestId, queryByTestId } = renderReader()

    expect(getByTestId("session-dialog").dataset.reason).toBe("device_limit_reached")
    expect(queryByTestId("reader")).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })

  it("opens the loan again when the dialog retries", () => {
    stopWith.mockReturnValueOnce({ reason: "device_limit_reached" })

    const { getByText, getByTestId } = renderReader()
    fireEvent.click(getByText("retry"))

    expect(readerMounts).toHaveBeenCalledTimes(2)
    expect(getByTestId("reader")).toBeTruthy()
  })

  it("leaves the page only when the patron closes the dialog", () => {
    stopWith.mockReturnValueOnce({ reason: "open_failed" })

    const { onClose, getByText } = renderReader()
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(getByText("close"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("explains a loan that expired while open", () => {
    stopWith.mockReturnValueOnce({ reason: "access_expired" })

    const { onClose, getByTestId, queryByTestId } = renderReader()

    expect(getByTestId("session-dialog").dataset.reason).toBe("access_expired")
    expect(queryByTestId("reader")).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })

  it("explains a session that moved elsewhere", () => {
    stopWith.mockReturnValueOnce({ reason: "taken_over", scope: "device", activeDeviceId: "other" })

    const { onClose, getByTestId } = renderReader()

    expect(getByTestId("session-dialog").dataset.reason).toBe("taken_over")
    expect(onClose).not.toHaveBeenCalled()
  })
})
