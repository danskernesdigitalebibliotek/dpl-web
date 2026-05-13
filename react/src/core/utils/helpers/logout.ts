import { QueryClient } from "react-query";
import { LOGOUT_FLAG_KEY } from "../../token";

/**
 * Clears all user-visible content and client-side state, then navigates to the
 * logout URL. The DOM is emptied and hidden before navigation so the browser's
 * back/forward cache snapshot contains no authenticated data.
 */
export const performLogout = (logoutUrl: URL, queryClient: QueryClient) => {
  document.body.innerHTML = "";
  document.documentElement.style.visibility = "hidden";
  queryClient.clear();
  // Clear all session data, then set the logout flag for the pageshow handler.
  sessionStorage.clear();
  sessionStorage.setItem(LOGOUT_FLAG_KEY, "1");
  // Delay navigation until the blank page is painted so the
  // bfcache snapshot contains no user data.
  requestAnimationFrame(() => {
    window.location.replace(logoutUrl.toString());
  });
};
