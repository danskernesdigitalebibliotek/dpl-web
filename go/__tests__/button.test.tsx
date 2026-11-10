import { createEvent, fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/shared/button/Button"

describe("Button", () => {
  describe("ariaDisabled", () => {
    it("marks the button unavailable without taking it out of the tab order", () => {
      render(<Button ariaDisabled>Forlæng lån</Button>)

      const button = screen.getByRole("button", { name: "Forlæng lån" }) as HTMLButtonElement
      expect(button.getAttribute("aria-disabled")).toBe("true")
      expect(button.disabled).toBe(false)
      expect(button.tabIndex).toBeGreaterThanOrEqual(0)

      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it("drops onClick", () => {
      const onClick = vi.fn()
      render(
        <Button ariaDisabled onClick={onClick}>
          Forlæng lån
        </Button>
      )

      fireEvent.click(screen.getByRole("button"))
      expect(onClick).not.toHaveBeenCalled()
    })

    it("suppresses Enter and Space, which activate a focused button natively", () => {
      const onKeyDown = vi.fn()
      render(
        <Button ariaDisabled onKeyDown={onKeyDown}>
          Forlæng lån
        </Button>
      )

      const button = screen.getByRole("button")
      for (const key of ["Enter", " "]) {
        const event = createEvent.keyDown(button, { key })
        fireEvent(button, event)
        expect(event.defaultPrevented).toBe(true)
      }
      expect(onKeyDown).not.toHaveBeenCalled()
    })

    it("takes pointer events out of reach, so other handlers cannot fire either", () => {
      render(<Button ariaDisabled>Forlæng lån</Button>)

      expect(screen.getByRole("button").className).toContain("aria-disabled:pointer-events-none")
    })

    it("leaves onClick alone when not set", () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Forlæng lån</Button>)

      fireEvent.click(screen.getByRole("button"))
      expect(onClick).toHaveBeenCalledOnce()
    })
  })

  // asChild renders a Radix Slot, which merges props onto the child rather
  // than replacing them — dropping onClick here would not reach a handler the
  // child brought itself, and an <a> would keep its href. The prop types rule
  // the combination out; this covers the half that types cannot.
  it("still forwards a child's onClick under asChild", () => {
    const onClick = vi.fn()
    render(
      <Button asChild>
        <a href="#edition" onClick={onClick}>
          Prøv e-bog
        </a>
      </Button>
    )

    fireEvent.click(screen.getByText("Prøv e-bog"))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
