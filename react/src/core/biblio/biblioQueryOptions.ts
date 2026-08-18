/**
 * `throwOnError: false` is load-bearing. The app's QueryClient sends anything
 * that is not a Fetcher error to the error boundary, and the Biblio client
 * throws plain `Error` and `ZodError` - so a missing base url would replace
 * the whole page. A provider we are migrating TO must degrade to Publizon
 * instead. Write paths keep their own `onError`.
 */
export const biblioQueryOptions = {
  throwOnError: false
} as const;

export default biblioQueryOptions;
