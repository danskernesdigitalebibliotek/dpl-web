# FB CMS Content and Configuration Cache Handling in Go

## Context

We wanted to address performance concerns specifically related to FB CMS that
delivers page data and configuration for Go. The FB CMS serves as the primary
content management system providing:

- Dynamic page content (category pages, articles, etc.)
- Application configuration data

Reducing load on FB CMS while ensuring content freshness when editors make
changes was a key requirement.

## Decision

Using cache in an application is not a trivial matter. The caching layer can,
by accident, save a malformed state. Glitches, eg. network errors, can result
in the cache not being renewed.

By having a simple model and clear rules for the caching strategy it can help
troubleshooting/debugging when things go wrong.

### Caching Strategy for FB CMS

Caching is implemented at the request level using Next.js's caching method by
using the "use cache" directives in functions. This approach allows for targeted
cache invalidation strategies using cache tags.

#### FB CMS API Content and Configuration

Makes use of the ["use cache" directive](https://nextjs.org/docs/app/api-reference/directives/use-cache) of Next.js.

##### Page Caching

When requesting page data for the first time, eg. a category page, data is being
stored server side, in Go's (Next.js's) cache. The cache is saved in memory
runtime and is stored infinitely. The cache is marked with cache tags that are
delivered as a part of the response from FB CMS. If an editor followingly makes
a change to the category a revalidation request is sent from FB CMS to the Go
application, which removes the data from the cache.

##### Configuration Caching

The application relies on configuration that is administered in FB CMS. We do
NOT make use of cache tags in the configuration fetching but still we make use
of the "use cache" directive. According to the
[Next.js documentation](https://nextjs.org/docs/app/api-reference/functions/cacheLife#default-cache-profiles)
the default cache lifetime should be around **15 minutes** before it is revalidated.

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

### Cache Invalidation

#### Revalidation Endpoint

FB CMS triggers cache invalidation by calling:

```txt
GET /api/cache/revalidate?secret={DRUPAL_REVALIDATE_SECRET}&tags=tag1,tag2,tag3
```

#### Manual Invalidation

```typescript
// Next.js cache tags
revalidateTag("category-123")
```

## Alternatives considered

There are loads of other possibilities in cache land. Other cache stores could
be used eg Redis, but of course it introduces another complexity.

By sticking to cache handling at the fetching level it should make it easier to
understand the flow of cached data. That being said we could also consider
caching the FB CMS content at the rendering level, which would prevent logic
being executed and thereby improve performance (it is unclear how much though).

## Consequences

By using cache tags we can store the content infinitely which is obviously good
for the performance of the FB CMS and the FB CMS GraphQL API, because it makes
sure that we have a minimal amount of requests sent to it.

NOTE:
The configuration cache could be added to the cache tag handling. It would demand
invalidation requests sent when ever configuration is updated at the FB CMS - so
additional coding is required in both the Go and in the FB CMS application.
