/**
 * Options shared by the queries behind the dashboard recommendations. The
 * section is decorative, so a failed request hides it instead of throwing to
 * the ErrorBoundary and taking the whole dashboard down. A failure is also
 * not retried: it counts as a miss, and the next seed is tried at once
 * instead of after the default retries' backoff.
 */
export const recommendationQueryOptions = {
  throwOnError: false,
  retry: false,
  // A missed attempt stays mounted under the one that hit. Were its data to go
  // stale, a window focus or reconnect would refetch it, and a miss that now
  // hits would swap its slider in under the patron.
  staleTime: Infinity
} as const;
