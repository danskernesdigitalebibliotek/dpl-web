# Cache work plan

## Steps

* Upgrade Next + tanstack react-query
* Update next config til at køre dynamivIO så vi kan bruge cache tags
* Suspense in server components
* Testing of the revalidation endpoint
* Revalidation endpoint
* Invalidation env secrets should be handled
* Implement cache tags in codegen + fetcher
* Handle cache tags in all dpl-cms fetching functions
* Set queryclient cache on dpl-cms to stale (bypass react query)
* Set a 1 min cache on all other query clients
* Investigate method for panic wiping production cache
* Document the whole thing
