const storageKey = "loanListReturnTarget";
let returnTarget: string | null | undefined;

// The reader and player are pages of their own, so coming back reloads the
// loan list, and the loans arrive too late for the browser to restore the
// scroll position. The list therefore finds its way back to the loan itself.
export const rememberReturnTarget = (elementId: string) =>
  sessionStorage.setItem(storageKey, elementId);

// Read once per page load and always cleared, so a target left behind by a
// visit that never came back cannot fire later. Only a back navigation - the
// way the reader and player close - scrolls.
const takeReturnTarget = () => {
  if (returnTarget === undefined) {
    const [navigation] = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];
    returnTarget =
      navigation?.type === "back_forward"
        ? sessionStorage.getItem(storageKey)
        : null;
    sessionStorage.removeItem(storageKey);
  }
  return returnTarget;
};

export const scrollToReturnTarget = (elementId: string) => {
  if (takeReturnTarget() !== elementId) return;
  returnTarget = null;
  document.getElementById(elementId)?.scrollIntoView({ block: "center" });
};
