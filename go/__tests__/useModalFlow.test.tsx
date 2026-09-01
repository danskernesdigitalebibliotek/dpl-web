import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"

type View = "list" | "details" | "receipt"

const setup = () => renderHook(() => useModalFlow<View>({ initial: "list" }))

describe("useModalFlow", () => {
  it("starts on the initial view moving forward, with no history", () => {
    const { result } = setup()
    expect(result.current.view).toBe("list")
    expect(result.current.direction).toBe(1)
    expect(result.current.canGoBack).toBe(false)
  })

  it("goTo moves forward and opens up back navigation", () => {
    const { result } = setup()
    act(() => result.current.goTo("details"))
    expect(result.current.view).toBe("details")
    expect(result.current.direction).toBe(1)
    expect(result.current.canGoBack).toBe(true)
  })

  it("back retraces the path actually taken and returns the target view", () => {
    const { result } = setup()
    act(() => result.current.goTo("details"))
    act(() => result.current.goTo("receipt"))

    let target: View | undefined
    act(() => {
      target = result.current.back()
    })
    expect(target).toBe("details")
    expect(result.current.view).toBe("details")
    expect(result.current.direction).toBe(-1)

    act(() => {
      target = result.current.back()
    })
    expect(target).toBe("list")
    expect(result.current.view).toBe("list")
    expect(result.current.canGoBack).toBe(false)
  })

  it("back at the flow's root is a no-op", () => {
    const { result } = setup()
    let target: View | undefined
    act(() => {
      target = result.current.back()
    })
    expect(target).toBeUndefined()
    expect(result.current.view).toBe("list")
  })

  it("supports branching flows without bookkeeping", () => {
    const { result } = setup()
    // list → receipt directly (skipping details), then back to list.
    act(() => result.current.goTo("receipt"))
    let target: View | undefined
    act(() => {
      target = result.current.back()
    })
    expect(target).toBe("list")
    expect(result.current.view).toBe("list")
  })

  it("reset starts the history over at the given view", () => {
    const { result } = setup()
    act(() => result.current.goTo("details"))
    act(() => result.current.reset("receipt"))
    expect(result.current.view).toBe("receipt")
    expect(result.current.direction).toBe(1)
    expect(result.current.canGoBack).toBe(false)
  })
})
