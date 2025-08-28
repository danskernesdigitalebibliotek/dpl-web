# Cache handling in Go

## Context

We wanted to address two areas regarding performance:

- Reduce load on services - especially FB CMS that delivers page data and
  configuration for Go
- Speed up the delivery of the pages for the end user

## Decision

Using cache in an application is not a trivial matter. The caching layer can, by
accident, save a malformed state. Glitches, eg. network errors, can result in
the cache not being renewed.

By having a simple model and clear rules for the caching strategy it can help
troubleshooting/debugging when things go wrong.

### Caching strategy

Caching is implemented at the request level. When fetching data, the data is
stored in various ways (explained later). Subsequent fetches will collect the
data from the cache until the cache expire.

We have to ways of cache data:

- Using Nexjs's caching method by using the "use cache" directives in functions
- Using React Query's cache that is tied to the QueryClient being used

#### FB CMS API content and configuration

Makes use of the ["use cache" directive](https://nextjs.org/docs/app/api-reference/directives/use-cache) of Nextjs.

##### Page Caching

When requesting page data for the first time, eg. a category page, data is
being stored server side, in Go's (Nextjs's) cache.
The cache is saved in memory runtime and is stored infinitely. The cache is
marked with cache tags coming as a part of the response from FB CMS.
If an editor followingly makes a change to the category a revalidation request
is sent from FB CMS to the Go application, which removes the data from the cache.

##### Configuration Caching

The application relies on configuration that is administered in FB CMS.
We do NOT make use of cache tags in the configuration fetching but still we make
use of the "use cache" directive.
According to the [Nextjs documentation](https://nextjs.org/docs/app/api-reference/functions/cacheLife#default-cache-profiles)
the default cache lifetime should be around **15 minutes** before it is revalidated.

#### 3rd party service data

1. **FBI GraphQL API**: Search functionality and bibliographic data
2. **FBS REST API**: Patron services, loans, reservations
3. **Publizon/PubHub**: E-book services
4. **Unilogin**: Authentication services

Go fetches data from several 3rd party services. All the requests uses either
react query QueryClient - either server side or client side. Both query clients
makes use of the function `getQueryClientStaleTime()` which is, at the moment of
this writing, is set to **1 minute**. Unless the queryclient is told to
invalidate certain query keys the cache will live for that amount of time.

## Usage

### Implementation Examples

#### Page Caching with Cache Tags

```typescript
// Category page example
async function getPage(slug: string[]) {
  "use cache"
  const {
    go: { cacheTags },
    ...data
  } = await loadPageData({
    contentPath: slug.join("/"),
    type: "category",
  })

  if (cacheTags) {
    cacheTag(...cacheTags)
  }

  return { go: { cacheTags }, ...data }
}
```

#### Configuration Caching

```typescript
const getDplCmsPrivateConfigData = async () => {
  "use cache"
  // Default cache time: ~15 minutes
  try {
    const data = await queryDplCmsPrivateConfig()
    return privateConfigSchema.parse(data)
  } catch {
    // Fallback configuration
    return defaultConfig
  }
}
```

#### React Query Setup

```typescript
// Server-side QueryClient
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: getQueryClientStaleTime(), // 1 minute in production, 0 in dev
        },
      },
    })
)

// Client-side QueryClient
const [client] = useState(
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: getQueryClientStaleTime(),
      },
    },
  })
)
```

#### 3rd Party Service Queries

```typescript
// FBI Search API example
export const performSearch = fromPromise(
  ({ input: { q, filters, offset, limit, queryClient } }) => {
    const args = { q: { all: q }, offset, limit, filters }
    return queryClient.fetchQuery({
      queryKey: useSearchWithPaginationQuery.getKey(args),
      queryFn: useSearchWithPaginationQuery.fetcher(args),
    })
  }
)
```

### Cache Invalidation

#### Revalidation Endpoint

FB CMS triggers cache invalidation by calling:

```
GET /api/cache/revalidate?secret={DRUPAL_REVALIDATE_SECRET}&tags=tag1,tag2,tag3
```

#### Manual Invalidation

```typescript
// In React Query
queryClient.invalidateQueries({ queryKey: ["search", searchTerm] })

// Next.js cache tags
revalidateTag("category-123")
revalidatePath("/kategori/some-category")
```

## Alternatives considered

There are loads of other possibilities in cache land. Other cache stores could
be used eg Redis, but of course it introduces another complexity.

By sticking to cache handling at the fetching level it should make it easier to
understand the flow of cached data.
That being said we could also consider caching the FB CMS content at the
rendering level, which would prevent logic being executed and thereby improve
performance (it is unclear how much though).

## Consequences

### FB CMS cache

By using cache tags we can store the content infinitely which is obviously good
for the performance of the FB CMS and the FB CMS graph API, because it makes
sure that we have a minimal amount of requests sent to it.

The configuration cache could be added to the cache tag handling. It would demand
invalidation requests sent when ever configuration is updated at the FB CMS - so
additional coding is required in both the Go and in the FB CMS application.

### 3rd party service cache

The lifetime of the cache implemented in React Query is very low. The cache is
primarily added in order to improve the performance for the end user because we
do not have specific demands from the service providers to keep the request
frequency low.

Although we have a short cache life time on the 3rd party services, we should be
aware of invalidating the relevant cache(s) upon data mutations and on log out,
to keep data fresh.
