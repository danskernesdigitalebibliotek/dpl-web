import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import DisclosureControllable from "../../components/Disclosures/DisclosureControllable";

describe("DisclosureControllable", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls onOpen when transitioning from closed to open", () => {
    const onOpen = vi.fn();
    render(
      <DisclosureControllable
        id="test"
        summary={<span>summary</span>}
        onOpen={onOpen}
      >
        <span>content</span>
      </DisclosureControllable>
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("does not call onOpen when transitioning from open to closed", () => {
    const onOpen = vi.fn();
    render(
      <DisclosureControllable
        id="test"
        summary={<span>summary</span>}
        onOpen={onOpen}
      >
        <span>content</span>
      </DisclosureControllable>
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger); // open -> fires onOpen
    fireEvent.click(trigger); // close -> must not fire onOpen

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
