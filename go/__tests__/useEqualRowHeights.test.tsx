import { render } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type UseEqualRowHeight = typeof import("@/hooks/useEqualRowHeights").useEqualRowHeight

// Assigned per test from a fresh module instance — see resetModules below.
let useEqualRowHeight: UseEqualRowHeight

// jsdom lays nothing out, so every rect is zero. Each card is given the
// geometry the test is about: the card's top decides its row, the block's
// height is what gets equalised.
type Geometry = { top: number; height: number }

const stubGeometry = () => {
  const geometry = new Map<Element, Geometry>()

  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const { top = 0, height = 0 } = geometry.get(this) ?? {}
    // A minHeight the hook applied holds the element open, the way the browser
    // reports it, so a pass that measures without clearing reads its own
    // previous answer back.
    const applied = parseFloat((this as HTMLElement).style?.minHeight || "0")
    const reported = Math.max(height, applied)
    return {
      top,
      height: reported,
      bottom: top + reported,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: top,
    } as DOMRect
  })

  return geometry
}

const Card = ({ group, children }: { group: string; children?: React.ReactNode }) => {
  const { ref, groupAttribute } = useEqualRowHeight(group)
  return (
    <div data-equal-row-item>
      <div ref={ref} {...groupAttribute}>
        {children}
      </div>
    </div>
  )
}

const Grid = ({ group, count }: { group: string; count: number }) => (
  <div data-equal-row-container>
    {Array.from({ length: count }, (_, index) => (
      <Card key={index} group={group} />
    ))}
  </div>
)

// The hook defers its work to an animation frame, so the frame is run by hand.
// The stub below schedules it at 16ms.
const runFrame = () => {
  vi.advanceTimersByTime(16)
}

describe("useEqualRowHeight", () => {
  let geometry: Map<Element, Geometry>
  let observations: { target: Element; fire: () => void }[]

  beforeEach(async () => {
    // The hook keeps pending frames in a module-level map keyed by group. A
    // fresh module per test empties it, so a group name can be reused without
    // inheriting the previous test's pending frame.
    vi.resetModules()
    ;({ useEqualRowHeight } = await import("@/hooks/useEqualRowHeights"))

    vi.useFakeTimers()
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback) =>
        setTimeout(() => callback(performance.now()), 16) as unknown as number
    )
    vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
      clearTimeout(handle as unknown as NodeJS.Timeout)
    )
    // The hook re-measures on resize. The stub pairs each callback with what it
    // was asked to watch, so a test can fire the observation it is about rather
    // than every registered one.
    observations = []
    vi.stubGlobal(
      "ResizeObserver",
      class {
        callback: () => void
        constructor(callback: () => void) {
          this.callback = callback
        }
        observe(target: Element) {
          observations.push({ target, fire: this.callback })
        }
        disconnect() {}
      }
    )
    geometry = stubGeometry()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // Fires the observation watching `target`, so a test can resize exactly the
  // element it is about.
  const resize = (target: Element | null) =>
    observations.filter(observation => observation.target === target).forEach(({ fire }) => fire())

  const resizeAll = () => observations.forEach(({ fire }) => fire())

  const layout = (container: HTMLElement, cards: Geometry[]) => {
    const items = [...container.querySelectorAll<HTMLElement>("[data-equal-row-item]")]
    const blocks = [...container.querySelectorAll<HTMLElement>("[data-equal-row]")]
    cards.forEach((card, index) => {
      geometry.set(items[index], { top: card.top, height: card.height })
      geometry.set(blocks[index], { top: card.top, height: card.height })
    })
    return blocks
  }

  it("raises every block on a row to the tallest one", () => {
    const { container } = render(<Grid group="a" count={3} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 140 },
      { top: 0, height: 80 },
    ])

    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["140px", "140px", "140px"])
  })

  it("sizes each row independently", () => {
    const { container } = render(<Grid group="b" count={4} />)
    const blocks = layout(container, [
      { top: 0, height: 200 },
      { top: 0, height: 90 },
      { top: 400, height: 60 },
      { top: 400, height: 70 },
    ])

    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["200px", "200px", "70px", "70px"])
  })

  it("treats tops within the tolerance as one row", () => {
    const { container } = render(<Grid group="c" count={2} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 1.5, height: 130 },
    ])

    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["130px", "130px"])
  })

  it("keeps rows apart when the tops differ by more than the tolerance", () => {
    const { container } = render(<Grid group="d" count={2} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 3, height: 130 },
    ])

    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["100px", "130px"])
  })

  it("groups by the card's top rather than the block's", () => {
    const { container } = render(<Grid group="e" count={2} />)
    const items = [...container.querySelectorAll<HTMLElement>("[data-equal-row-item]")]
    const blocks = [...container.querySelectorAll<HTMLElement>("[data-equal-row]")]

    // Both cards start at the same top, but their blocks sit at their own
    // card's bottom, so the block tops are far apart.
    geometry.set(items[0], { top: 0, height: 300 })
    geometry.set(items[1], { top: 0, height: 300 })
    geometry.set(blocks[0], { top: 200, height: 100 })
    geometry.set(blocks[1], { top: 160, height: 140 })

    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["140px", "140px"])
  })

  it("measures the natural height rather than one a previous pass applied", () => {
    const { container } = render(<Grid group="f" count={2} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 140 },
    ])

    runFrame()
    expect(blocks[0].style.minHeight).toBe("140px")

    // The tall card shrinks. Without clearing, the row would stay at 140.
    layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 110 },
    ])
    resizeAll()
    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["110px", "110px"])
  })

  it("keeps separate groups out of each other's rows", () => {
    const { container } = render(
      <div data-equal-row-container>
        <Card group="left" />
        <Card group="right" />
      </div>
    )
    const items = [...container.querySelectorAll<HTMLElement>("[data-equal-row-item]")]
    const blocks = [...container.querySelectorAll<HTMLElement>("[data-equal-row]")]
    geometry.set(items[0], { top: 0, height: 100 })
    geometry.set(items[1], { top: 0, height: 250 })
    geometry.set(blocks[0], { top: 0, height: 100 })
    geometry.set(blocks[1], { top: 0, height: 250 })

    runFrame()

    expect(blocks[0].style.minHeight).toBe("100px")
    expect(blocks[1].style.minHeight).toBe("250px")
  })

  it("collapses the whole group's requests into one measuring pass", () => {
    const { container } = render(<Grid group="g" count={5} />)
    layout(
      container,
      Array.from({ length: 5 }, () => ({ top: 0, height: 100 }))
    )
    const rects = vi.mocked(Element.prototype.getBoundingClientRect)
    rects.mockClear()

    runFrame()

    // One pass over five cards, not one pass per card. The exact count is the
    // implementation's business; the order of magnitude is the contract.
    expect(rects.mock.calls.length).toBeLessThan(20)
  })

  it("re-measures once the fonts have settled", async () => {
    let settleFonts: () => void = () => {}
    const ready = new Promise<void>(resolve => {
      settleFonts = resolve
    })
    Object.defineProperty(document, "fonts", { value: { ready }, configurable: true })

    const { container } = render(<Grid group="fonts" count={2} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 140 },
    ])
    runFrame()
    expect(blocks[0].style.minHeight).toBe("140px")

    // A font swap makes the text taller after the first measurement.
    layout(container, [
      { top: 0, height: 180 },
      { top: 0, height: 140 },
    ])
    settleFonts()
    await vi.runAllTimersAsync()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["180px", "180px"])
  })

  // The late-resolve guard is not observable on its own: measure() filters to
  // connected peers, so an unmounted card is left alone either way. This holds
  // the outcome rather than the flag.
  it("leaves an unmounted card alone when the fonts settle late", async () => {
    let settleFonts: () => void = () => {}
    const ready = new Promise<void>(resolve => {
      settleFonts = resolve
    })
    Object.defineProperty(document, "fonts", { value: { ready }, configurable: true })

    const { container, unmount } = render(<Grid group="fonts-late" count={2} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 140 },
    ])

    unmount()
    settleFonts()
    await vi.runAllTimersAsync()

    expect(blocks.every(block => block.style.minHeight === "")).toBe(true)
  })

  // The same group name as the test above: a fresh module per test means its
  // pending frame cannot reach this one.
  it("starts from an empty pending-frame map", () => {
    const { container } = render(<Grid group="fonts-late" count={2} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 140 },
    ])

    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["140px", "140px"])
  })

  it("leaves unmounted peers alone", () => {
    const { container, unmount } = render(<Grid group="h" count={2} />)
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 140 },
    ])

    unmount()
    runFrame()

    expect(blocks.every(block => block.style.minHeight === "")).toBe(true)
  })

  // Text growing taller leaves the container width untouched, so a resize of
  // the content — and only the content — has to re-equalise the rows.
  it("re-measures when the block's own content resizes", () => {
    const { container } = render(
      <div data-equal-row-container>
        <Card group="i">
          <p data-testid="title-a">A</p>
        </Card>
        <Card group="i">
          <p data-testid="title-b">B</p>
        </Card>
      </div>
    )
    const blocks = layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 140 },
    ])

    runFrame()
    expect(blocks[0].style.minHeight).toBe("140px")

    // The text grows. The container keeps its width, so the only observation
    // that can report this is the one watching the content.
    layout(container, [
      { top: 0, height: 100 },
      { top: 0, height: 180 },
    ])
    resize(container.querySelector("[data-testid='title-b']"))
    runFrame()

    expect(blocks.map(block => block.style.minHeight)).toEqual(["180px", "180px"])
  })
})
