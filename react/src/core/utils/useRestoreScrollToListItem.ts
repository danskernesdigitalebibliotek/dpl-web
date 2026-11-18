import { RefObject, useCallback, useEffect, useRef } from "react";

const itemParam = "item";

// Removes the item from the URL, and lets the browser handle a later return.
const forgetItem = (url: URL) => {
  url.searchParams.delete(itemParam);
  window.history.replaceState(window.history.state, "", url);
  window.history.scrollRestoration = "auto";
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
 * item is added to the URL of the page, and scrolled to and focused once the
 * list is ready.
 */
const useRestoreScrollToListItem = ({
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

    const url = new URL(window.location.href);
    const itemId = url.searchParams.get(itemParam);
    if (itemId === null) {
      return;
    }
    // Only restore once, so a reload or a copied link does not jump to the
    // item.
    forgetItem(url);

    const item = listRef.current?.querySelector(
      `[data-item-id="${CSS.escape(itemId)}"]`
    );
    if (item instanceof HTMLElement) {
      item.scrollIntoView({ block: "center" });
      item.focus({ preventScroll: true });
    }
  }, [enabled, isReady, listRef]);

  // A page restored from the back/forward cache is shown as it was left, with
  // its scroll position, and is not rendered again. Forget the item, or a
  // later list, e.g. after editing the search, would scroll to it.
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const onPageShow = (event: PageTransitionEvent) => {
      const url = new URL(window.location.href);
      if (event.persisted && url.searchParams.has(itemParam)) {
        forgetItem(url);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [enabled]);

  return useCallback(
    (itemId: string) => {
      if (!enabled) {
        return;
      }
      // Set synchronously, as the click is about to leave the page.
      const url = new URL(window.location.href);
      url.searchParams.set(itemParam, itemId);
      window.history.replaceState(window.history.state, "", url);
      // Stop the browser from restoring a scroll position on return, which
      // would make the page jump before the list scrolls to the item.
      window.history.scrollRestoration = "manual";
    },
    [enabled]
  );
};

export default useRestoreScrollToListItem;
