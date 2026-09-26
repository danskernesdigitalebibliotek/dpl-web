// Inserts a `.content-list__month-separator` before the first event of each
// month in the events overview. Each item carries `data-content-list-month`
// (the 'Y-m' grouping key) and `data-content-list-month-label` (the month name
// to show).
//
// The infinite-scroll pager renders each page as its own `.content-list` <ul>
// inside an opt-in `.content-list-month-wrapper`. We walk every <ul> in
// document order, so a month spanning a page boundary gets no duplicate
// heading. Keeping that heading pinned across the boundary is a CSS concern
// (the <ul>s are dissolved with `display: contents`, see content-list.scss) -
// this file never restructures the pager's DOM. A MutationObserver re-runs on
// each new page, rebuilding separators from scratch.

const SEPARATOR_CLASS = "content-list__month-separator";
const FIRST_SEPARATOR_CLASS = "content-list__month-separator--first";
const ITEM_SELECTOR = "li.content-list__item[data-content-list-month]";
const WRAPPER_SELECTOR = ".content-list-month-wrapper";

// Containers already wired up, so behaviour re-runs (Drupal AJAX) don't attach
// a second observer to a container that already has one.
const initializedContainers = new WeakSet();

const renderSeparators = (container) => {
  // Rebuild from scratch so we never end up with duplicate or stale
  // separators when the infinite scroll pager appends a new page.
  container
    .querySelectorAll(`.${SEPARATOR_CLASS}`)
    .forEach((separator) => separator.remove());

  let lastMonth = null;
  let isFirstSeparator = true;

  // One pass in document order across every <ul>, so `lastMonth` de-duplicates
  // a month that spans a page boundary.
  container.querySelectorAll(ITEM_SELECTOR).forEach((item) => {
    const month = item.getAttribute("data-content-list-month");

    if (!month || month === lastMonth) {
      return;
    }

    // Fall back to the grouping key if no explicit label is set, so the
    // separator always shows something.
    const label = item.getAttribute("data-content-list-month-label") || month;

    const separator = document.createElement("li");
    separator.className = SEPARATOR_CLASS;

    // The separator is a visual scanning aid; every event already announces
    // its month through its own date. Hiding it from assistive technology
    // keeps it from being read as an item of the list.
    separator.setAttribute("aria-hidden", "true");

    // The very first month heading sits at the top of the list; it shouldn't
    // get the large top spacing that separates one month from the previous.
    if (isFirstSeparator) {
      separator.classList.add(FIRST_SEPARATOR_CLASS);
    }

    separator.textContent = label;

    item.parentNode.insertBefore(separator, item);
    lastMonth = month;
    isFirstSeparator = false;
  });
};

const affectsItems = (node) =>
  node.nodeType === Node.ELEMENT_NODE &&
  (node.matches(".content-list__item") ||
    !!node.querySelector(".content-list__item"));

const setupMonthSeparators = (container) => {
  // A behaviour re-run may re-visit a container we already handle; only wire
  // it once. Also skip lists without month data (e.g. the article overview),
  // which share the same markup but carry no month attributes.
  if (initializedContainers.has(container)) {
    return;
  }
  if (!container.querySelector(ITEM_SELECTOR)) {
    return;
  }
  initializedContainers.add(container);

  renderSeparators(container);

  // Re-render when the infinite scroll pager appends a new page (a new <ul>)
  // or when items are otherwise added/removed.
  const observer = new MutationObserver((mutations) => {
    const itemsChanged = mutations.some(
      (mutation) =>
        Array.from(mutation.addedNodes).some(affectsItems) ||
        Array.from(mutation.removedNodes).some(affectsItems),
    );

    if (!itemsChanged) {
      return;
    }

    // Pause observing while we mutate the DOM ourselves, so our own
    // separator changes don't trigger another pass.
    observer.disconnect();
    renderSeparators(container);
    observer.observe(container, { childList: true, subtree: true });
  });

  observer.observe(container, { childList: true, subtree: true });
};

const processScope = (root) => {
  // Treat all pages under one month wrapper as a single list; a content list
  // outside any wrapper stands alone.
  const scope = root && root.querySelectorAll ? root : document;

  const lists = [...scope.querySelectorAll(".content-list")];
  if (scope.matches && scope.matches(".content-list")) {
    lists.push(scope);
  }

  const containers = new Set();
  lists.forEach((list) => {
    containers.add(list.closest(WRAPPER_SELECTOR) || list);
  });

  containers.forEach((container) => setupMonthSeparators(container));
};

// In the CMS the events view re-renders via AJAX (infinite scroll, exposed
// filters, sort) without firing DOMContentLoaded, so we register a Drupal
// behaviour that re-runs on every AJAX response. For non-Drupal consumers the
// file stays framework-agnostic: one pass over the document, run immediately
// if it has already loaded (e.g. when the file is lazily required) or on
// DOMContentLoaded otherwise.
if (window.Drupal && window.Drupal.behaviors) {
  window.Drupal.behaviors.contentListMonthSeparator = {
    attach: (context) => processScope(context),
  };
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => processScope(document));
} else {
  processScope(document);
}
