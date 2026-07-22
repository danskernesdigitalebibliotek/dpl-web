import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import ToggleListViewButtons from "../../apps/loan-list/list/ToggleListViewButtons";
import { ListView } from "../../core/utils/types/list-view";

// useText throws on missing keys; returning the key keeps the render simple and
// lets us target buttons by their aria-label key.
vi.mock("../../core/utils/text", () => ({
  useText: () => (key: string) => key
}));

// Mirrors loan-list's wiring: the URL is the single source of truth for the
// view, and ToggleListViewButtons just calls the setter it is handed.
const Harness = () => {
  const [view, setView] = useQueryState(
    "listview",
    parseAsStringLiteral<ListView>(["list", "stack"]).withDefault("list")
  );
  return (
    <ToggleListViewButtons
      setView={setView}
      view={view}
      disableRenewLoansButton={false}
      pageSize={10}
      loans={[]}
      openRenewLoansModal={() => undefined}
    />
  );
};

describe("ToggleListViewButtons url sync", () => {
  afterEach(() => cleanup());

  it("writes the chosen list view into the URL and reflects it", async () => {
    const onUrlUpdate = vi.fn();

    render(<Harness />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      )
    });

    fireEvent.click(screen.getByLabelText("loanListAriaLabelStackButtonText"));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("listview")).toBe(
      "stack"
    );
    // The view state derives from the URL, so the button reflects the change.
    expect(
      screen
        .getByLabelText("loanListAriaLabelStackButtonText")
        .getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("initialises the view from the URL", () => {
    render(<Harness />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams="?listview=stack">
          {children}
        </NuqsTestingAdapter>
      )
    });

    expect(
      screen
        .getByLabelText("loanListAriaLabelStackButtonText")
        .getAttribute("aria-pressed")
    ).toBe("true");
  });
});
