/**
 * Options shared by the queries behind the dashboard recommendations. The
 * section is decorative, so a failed request hides it instead of throwing to
 * the ErrorBoundary and taking the whole dashboard down. A failure is also
 * not retried: it counts as a miss, and the next seed is tried at once
 * instead of after the default retries' backoff.
 */
export const recommendationQueryOptions = {
  throwOnError: false,
  retry: false
} as const;
