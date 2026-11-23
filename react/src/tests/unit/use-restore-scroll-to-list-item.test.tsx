import React, { useRef } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import useRestoreScrollToListItem from "../../core/utils/useRestoreScrollToListItem";

// useRestoreScrollToListItem brings the user back to the work they opened
// from a list, e.g. the search result, when they return with the browser's
// back button. The clicked work is kept in the URL until the list is ready.

type ListProps = { isReady: boolean; enabled?: boolean };

// Renders a list like its callers do, and exposes the click handler.
let rememberItem: (itemId: string) => void;
const List = ({ isReady, enabled }: ListProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  rememberItem = useRestoreScrollToListItem({ listRef, isReady, enabled });
  return (
    <ul ref={listRef}>
      {["work-1", "work-2"].map((id) => (
        <li key={id} data-item-id={id} tabIndex={-1}>
          {id}
        </li>
      ))}
    </ul>
  );
};

const item = (id: string) =>
  document.querySelector(`[data-item-id="${id}"]`) as HTMLElement;

const itemInUrl = () => new URL(window.location.href).searchParams.get("item");

const setUrl = (search: string) =>
  window.history.replaceState(null, "", `/search${search}`);

// Shows the page as the browser does on a load (persisted false) or when
// restoring it from the back/forward cache (persisted true). happy-dom's
// PageTransitionEvent lacks persisted, so it is set on a plain event.
const showPage = (persisted: boolean) =>
  act(() => {
    const event = new Event("pageshow");
    Object.defineProperty(event, "persisted", { value: persisted });
    window.dispatchEvent(event);
  });

describe("useRestoreScrollToListItem", () => {
  let scrollIntoView: Mock<HTMLElement["scrollIntoView"]>;

  beforeEach(() => {
    setUrl("?q=harry");
    window.history.scrollRestoration = "auto";
    scrollIntoView = vi.fn<HTMLElement["scrollIntoView"]>();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    cleanup();
  });

  // The click is about to leave the page, so the work is added to its URL
  // right away, and the browser is stopped from restoring a scroll position
  // of its own when returning.
  it("keeps the clicked item in the URL", () => {
    render(<List isReady />);

    rememberItem("work-2");

    expect(itemInUrl()).toBe("work-2");
    expect(new URL(window.location.href).searchParams.get("q")).toBe("harry");
    expect(window.history.scrollRestoration).toBe("manual");
  });

  // Returning to the list scrolls to the work and gives it focus. The work is
  // removed from the URL, so a reload does not jump to it again.
  it("scrolls to and focuses the item once the list is ready", () => {
    setUrl("?q=harry&item=work-2");
    window.history.scrollRestoration = "manual";

    render(<List isReady />);

    expect(scrollIntoView).toHaveBeenCalledWith({ block: "center" });
    expect(scrollIntoView.mock.contexts[0]).toBe(item("work-2"));
    expect(document.activeElement).toBe(item("work-2"));
    expect(itemInUrl()).toBeNull();
    expect(window.history.scrollRestoration).toBe("auto");
  });

  // The works are loaded after the page, so there is nothing to scroll to
  // until they are shown.
  it("waits for the list to be ready", () => {
    setUrl("?q=harry&item=work-2");
    const { rerender } = render(<List isReady={false} />);

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(itemInUrl()).toBe("work-2");

    rerender(<List isReady />);

    expect(document.activeElement).toBe(item("work-2"));
  });

  // E.g. loading more works or a campaign showing up must not move the user
  // back to the work.
  it("only restores once", () => {
    setUrl("?q=harry&item=work-2");
    const { rerender } = render(<List isReady />);
    setUrl("?q=harry&item=work-1");

    rerender(<List isReady={false} />);
    rerender(<List isReady />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(itemInUrl()).toBe("work-1");
  });

  it("does nothing when there is no item in the URL", () => {
    render(<List isReady />);

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(window.history.scrollRestoration).toBe("auto");
  });

  // A page restored from the back/forward cache is shown as it was left, and
  // the list is not rendered again. The work must still be removed from the
  // URL, or a later list, e.g. after editing the search, would scroll to it.
  it("forgets the item when the page is restored from the back/forward cache", () => {
    render(<List isReady />);
    rememberItem("work-2");

    showPage(true);

    expect(itemInUrl()).toBeNull();
    expect(window.history.scrollRestoration).toBe("auto");
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("keeps the item when the page is shown without the cache", () => {
    render(<List isReady={false} />);
    rememberItem("work-2");

    showPage(false);

    expect(itemInUrl()).toBe("work-2");
  });

  // Lists which do not restore the clicked item leave the URL alone.
  it("does nothing when disabled", () => {
    setUrl("?q=harry&item=work-2");
    render(<List isReady enabled={false} />);

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(itemInUrl()).toBe("work-2");

    rememberItem("work-1");
    showPage(true);

    expect(itemInUrl()).toBe("work-2");
    expect(window.history.scrollRestoration).toBe("auto");
  });
});
