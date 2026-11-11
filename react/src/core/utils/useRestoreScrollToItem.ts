import { RefObject, useCallback, useEffect, useRef } from "react";

const storageKey = "dpl-restore-scroll-to-item";

// Identifies the page the item was clicked on. The query parameters are
// sorted and re-encoded, as scripts rewriting the URL may change their order.
const getPageKey = () => {
  const url = new URL(window.location.href);
  url.searchParams.sort();
  return `${url.pathname}${url.search}`;
};

type UseRestoreScrollToItemProps = {
  // The list containing the items, each marked with a data-item-id attribute.
  listRef: RefObject<HTMLElement | null>;
  // Whether the list has rendered all the items it is going to restore.
  isReady: boolean;
  enabled?: boolean;
};

/**
 * Brings the user back to the item they clicked in a list when they return to
 * the page, e.g. with the browser's back button.
 *
 * The browser's own scroll restoration runs before an asynchronously loaded
 * list has rendered, so it lands at the wrong position. Instead the clicked
 * item is remembered for the page, and scrolled to and focused once the list
 * is ready.
 *
 * The item is kept in sessionStorage rather than on the history entry, as
 * other scripts may replace the history state.
 */
const useRestoreScrollToItem = ({
  listRef,
  isReady,
  enabled = true
}: UseRestoreScrollToItemProps) => {
  const hasRestored = useRef(false);

  useEffect(() => {
    if (!enabled || !isReady || hasRestored.current) {
      return;
    }
    hasRestored.current = true;

    let stored: { page?: string; itemId?: string } = {};
    try {
      stored = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}");
      // Only restore once, and let the browser handle a later reload.
      window.sessionStorage.removeItem(storageKey);
    } catch {
      return;
    }
    window.history.scrollRestoration = "auto";
    if (stored.page !== getPageKey() || typeof stored.itemId !== "string") {
      return;
    }

    const item = listRef.current?.querySelector(
      `[data-item-id="${CSS.escape(stored.itemId)}"]`
    );
    if (item instanceof HTMLElement) {
      item.scrollIntoView({ block: "center" });
      item.focus({ preventScroll: true });
    }
  }, [enabled, isReady, listRef]);

  return useCallback(
    (itemId: string) => {
      if (!enabled) {
        return;
      }
      try {
        window.sessionStorage.setItem(
          storageKey,
          JSON.stringify({ page: getPageKey(), itemId })
        );
      } catch {
        // Without storage the browser's own scroll restoration is used.
        return;
      }
      // Stop the browser from restoring a scroll position on return, which
      // would make the page jump before the list scrolls to the item.
      window.history.scrollRestoration = "manual";
    },
    [enabled]
  );
};

export default useRestoreScrollToItem;
