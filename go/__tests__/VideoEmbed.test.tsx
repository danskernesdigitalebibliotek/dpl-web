import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import VideoEmbed from "@/components/paragraphs/shared/VideoEmbed"

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    const { fill, sizes, ...rest } = props
    void fill
    void sizes
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />
  },
}))

describe("VideoEmbed", () => {
  const defaults = {
    videoUrl: "https://media.videotool.dk?vn=fixture",
    title: "Sample video",
    aspect: "16/9",
  } as const

  it("fades the iframe in once it loads (opacity-0 → opacity-100)", () => {
    render(<VideoEmbed {...defaults} thumbnailUrl="https://example.com/poster.jpg" />)

    const iframe = screen.getByTitle(defaults.title)
    expect(iframe.className).toContain("transition-opacity")
    expect(iframe.className).toContain("opacity-0")
    expect(iframe.className).not.toContain("opacity-100")

    fireEvent.load(iframe)

    expect(iframe.className).toContain("opacity-100")
    expect(iframe.className).not.toContain("opacity-0")
  })

  const queryPoster = () => document.querySelector("img[aria-hidden='true']")

  it("renders the poster image as a decorative backdrop when thumbnailUrl is provided", () => {
    const thumbnailUrl = "https://example.com/poster.jpg"
    render(<VideoEmbed {...defaults} thumbnailUrl={thumbnailUrl} />)

    const poster = queryPoster()
    expect(poster).not.toBeNull()
    expect(poster?.getAttribute("alt")).toBe("")
    expect(poster?.getAttribute("src")).toBe(thumbnailUrl)
  })

  it.each([
    ["null", null],
    ["undefined", undefined],
  ])("omits the poster image when thumbnailUrl is %s", (_label, thumbnailUrl) => {
    render(<VideoEmbed {...defaults} thumbnailUrl={thumbnailUrl} />)
    expect(queryPoster()).toBeNull()
  })

  it("falls back to 'Video' as the iframe accessible name when title is missing", () => {
    render(<VideoEmbed videoUrl={defaults.videoUrl} aspect="16/9" />)
    expect(screen.getByTitle("Video")).toBeTruthy()
  })

  it("loads the iframe lazily", () => {
    render(<VideoEmbed {...defaults} />)
    expect(screen.getByTitle(defaults.title).getAttribute("loading")).toBe("lazy")
  })

  it("applies aspect-16/9 for horizontal videos and aspect-9/16 for vertical", () => {
    const { container, rerender } = render(<VideoEmbed {...defaults} aspect="16/9" />)
    expect(container.querySelector(".aspect-16\\/9")).not.toBeNull()

    rerender(<VideoEmbed {...defaults} aspect="9/16" />)
    expect(container.querySelector(".aspect-9\\/16")).not.toBeNull()
  })
})
