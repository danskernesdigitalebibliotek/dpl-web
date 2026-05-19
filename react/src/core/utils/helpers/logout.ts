import { QueryClient } from "react-query";

/**
 * Clears all user-visible content and client-side state, then navigates to the
 * logout URL. The DOM is emptied and hidden before navigation so the browser's
 * back/forward cache snapshot contains no authenticated data.
 */
export const performLogout = (logoutUrl: URL, queryClient: QueryClient) => {
  document.body.innerHTML = "";
  document.documentElement.style.visibility = "hidden";
  queryClient.clear();
  sessionStorage.clear();
  // Delay navigation until the blank page is painted so the
  // bfcache snapshot contains no user data.
  requestAnimationFrame(() => {
    window.location.replace(logoutUrl.toString());
  });
};
