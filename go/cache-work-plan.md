# Cache work plan

## Steps

* [DONE] Upgrade Next + tanstack react-query
* [DONE] Update next config til at køre dynamivIO så vi kan bruge cache tags
* [DONE] Skip react query client when fetching dpl-cms GraphQl API data
* [DONE] Suspense in server components
* [DONE] Testing of the revalidation endpoint
* [DONE] Revalidation endpoint
* [DONE] Invalidation env secrets should be handled
* Implement cache tags in codegen + fetcher
* Handle cache tags in all dpl-cms fetching functions
* Set queryclient cache on dpl-cms to stale (bypass react query)
* Set a 1 min cache on all other query clients
* Investigate method for panic wiping production cache
* Document the whole thing
