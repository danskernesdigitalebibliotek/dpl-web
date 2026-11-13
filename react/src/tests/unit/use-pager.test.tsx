import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import usePager from "../../components/result-pager/use-pager";

vi.mock("../../core/utils/text", () => ({
  useText: () => (key: string) => key
}));

// usePager drives the "show more" lists, e.g. the search result, advanced
// search, loans, reservations and favorites. Each click on "show more" adds
// another page of items below the ones already shown.

type PagerProps = Parameters<typeof usePager>[0];

// Renders the pager like its callers do, and exposes the hook's result.
let pager: ReturnType<typeof usePager>;
const Pager = (props: PagerProps) => {
  pager = usePager(props);
  return <pager.PagerComponent />;
};

const showMore = () =>
  fireEvent.click(screen.getByRole("button", { name: "showMoreText" }));

describe("usePager", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the first page", () => {
    render(<Pager hitcount={25} pageSize={10} />);

    expect(pager.page).toBe(0);
    expect(pager.pages).toEqual([0]);
    expect(pager.itemsShown).toBe(10);
    expect(pager.firstInNewPage).toBeNull();
  });

  // A search with fewer hits than a page must not claim to show more items
  // than it has, e.g. "showing 10 of 8".
  it("does not show more items than the hitcount", () => {
    render(<Pager hitcount={8} pageSize={10} />);

    expect(pager.itemsShown).toBe(8);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows the next page when showing more", () => {
    render(<Pager hitcount={25} pageSize={10} />);

    showMore();

    expect(pager.page).toBe(1);
    expect(pager.pages).toEqual([0, 1]);
    expect(pager.itemsShown).toBe(20);
    expect(pager.firstInNewPage).toBe(10);
  });

  // When everything is shown, there is nothing more to load.
  it("stops at the hitcount on the last page", () => {
    render(<Pager hitcount={25} pageSize={10} />);

    showMore();
    showMore();

    expect(pager.page).toBe(2);
    expect(pager.itemsShown).toBe(25);
    expect(screen.queryByRole("button")).toBeNull();
  });

  // Changing the search or a filter starts the list over on the first page.
  it("goes back to the first page when reset", () => {
    render(<Pager hitcount={25} pageSize={10} />);

    showMore();

    act(() => pager.resetPage());

    expect(pager.page).toBe(0);
    expect(pager.itemsShown).toBe(10);
    expect(pager.firstInNewPage).toBeNull();
  });

  // E.g. removing a favorite after showing more. The list keeps the items
  // shown instead of collapsing to the first page.
  it("keeps the page when the hitcount changes", () => {
    const { rerender } = render(<Pager hitcount={25} pageSize={10} />);
    showMore();

    rerender(<Pager hitcount={15} pageSize={10} />);

    expect(pager.page).toBe(1);
    expect(pager.itemsShown).toBe(15);
  });

  // The search result and advanced search keep the page in the URL. Opening a
  // work and going back with the browser's back button reloads the search
  // page. Before, the pager then started over on the first page, so the work
  // the user came from was gone from the list. Now the page is read back from
  // the URL.
  describe("with page state owned by the caller", () => {
    // Going back to a search where "show more" had been clicked twice shows
    // all three pages again, not just the first.
    it("shows all items up to the given page", () => {
      render(
        <Pager hitcount={45} pageSize={10} pageState={[2, () => undefined]} />
      );

      expect(pager.page).toBe(2);
      expect(pager.pages).toEqual([0, 1, 2]);
      expect(pager.itemsShown).toBe(30);
      expect(pager.firstInNewPage).toBe(20);
    });

    // Showing more updates the page in the URL, so going back restores it.
    it("sets the next page when showing more", () => {
      const setPage = vi.fn();
      render(<Pager hitcount={45} pageSize={10} pageState={[2, setPage]} />);

      showMore();

      expect(setPage).toHaveBeenCalledWith(3);
    });

    // A new search must not open on the page of the previous one.
    it("sets the first page when reset", () => {
      const setPage = vi.fn();
      render(<Pager hitcount={45} pageSize={10} pageState={[2, setPage]} />);

      act(() => pager.resetPage());

      expect(setPage).toHaveBeenCalledWith(0);
    });
  });
});
