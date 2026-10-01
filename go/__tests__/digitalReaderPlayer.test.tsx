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
  onClose: (interruption?: unknown) => void
  onOpenError: (failure: unknown) => void
}

// The reader is reduced to what it reports back: whatever `scripted` says on
// each mount, so a second mount with nothing scripted is a successful retry.
const scripted = vi.fn<() => { refuse?: unknown; interrupt?: unknown } | undefined>()
const readerMounts = vi.fn()

const ReaderStub = ({ onClose, onOpenError }: ReaderProps) => {
  useEffect(() => {
    readerMounts()
    const script = scripted()
    if (script?.refuse) onOpenError(script.refuse)
    if (script?.interrupt) onClose(script.interrupt)
  }, [onClose, onOpenError])
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
    scripted.mockReturnValueOnce({ refuse: { reason: "device_limit_reached" } })

    const { onClose, getByTestId, queryByTestId } = renderReader()

    expect(getByTestId("session-dialog").dataset.reason).toBe("device_limit_reached")
    expect(queryByTestId("reader")).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })

  it("opens the loan again when the dialog retries", () => {
    scripted.mockReturnValueOnce({ refuse: { reason: "device_limit_reached" } })

    const { getByText, getByTestId } = renderReader()
    fireEvent.click(getByText("retry"))

    expect(readerMounts).toHaveBeenCalledTimes(2)
    expect(getByTestId("reader")).toBeTruthy()
  })

  it("leaves the page only when the patron closes the dialog", () => {
    scripted.mockReturnValueOnce({ refuse: { reason: "open_failed" } })

    const { onClose, getByText } = renderReader()
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(getByText("close"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("explains a session that moved elsewhere", () => {
    scripted.mockReturnValueOnce({
      interrupt: { reason: "taken_over", scope: "device", activeDeviceId: "other" },
    })

    const { onClose, getByTestId } = renderReader()

    expect(getByTestId("session-dialog").dataset.reason).toBe("taken_over")
    expect(onClose).not.toHaveBeenCalled()
  })
})
