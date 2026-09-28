const storageKey = "loanListReturnTarget";

// The reader and player are pages of their own, so coming back reloads the
// loan list, and the loans arrive too late for the browser to restore the
// scroll position. The list therefore finds its way back to the loan itself.
export const rememberReturnTarget = (elementId: string) =>
  sessionStorage.setItem(storageKey, elementId);

export const scrollToReturnTarget = (elementId: string) => {
  if (sessionStorage.getItem(storageKey) !== elementId) return;
  sessionStorage.removeItem(storageKey);
  document.getElementById(elementId)?.scrollIntoView({ block: "center" });
};
