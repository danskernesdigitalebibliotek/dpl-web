# NextJS Cache Invalidation Runbook

## Overview

This runbook provides step-by-step instructions for invalidating NextJS cache in
the GO application when content changes in DPL-CMS are not reflecting on the frontend.

## When to Use This Runbook

- Content changes in DPL-CMS are not appearing on the GO frontend
- Specific pages or content sections appear stale

## Prerequisites

- Access to the GO site's cache invalidation endpoint
- Knowledge of the specific content that needs cache invalidation
- Cache invalidation secret for the environment

## Step-by-Step Procedure

### Step 1: Identify Cache Tags

1. Make a request to the DPL-CMS `/graphql` endpoint for the content you want to
   invalidate.
2. Check the response headers for `x-dpl-graphql-cache-tags`
3. Look for cache tags that start with `node:[id]` where `[id]` is the content identifier

When you want to get the cache tags you can find a query by either looking
through the dpl-go repository for queries or construct one by using the
[graphql explorer tool](https://staging.dplplat01.dpl.reload.dk/admin/config/graphql/servers/manage/graphql_compose_server/explorer)
in dpl-cms.
Here is a query that probably will not change in the future:

```graphql
query getDplCmsPublicConfiguration {
  goConfiguration {
    public {
      libraryInfo {
        name
      }
    }
  }
}
```

**Example Response Header:**

```
x-dpl-graphql-cache-tags: node:597,category:library,content:article
```

### Step 2: Invalidate Cache

1. Construct the cache invalidation URL:

   ```txt
   POST /cache/invalidate?tags=node:[id]&secret=[secret_key]
   ```

2. Make a POST request to the GO site's cache invalidation endpoint

**Example for Tårnby Library:**

```bash
curl -X POST "https://go.taarnbybib.dk/cache/revalidate?secret=JYTgIdNLkl3RBip7zJAW3K1qqiAb7fWmp2M5NgoMrowPq2u3iFhZi5t9i2Y53j32askdnasdj/w17chieeYvw==&tags=node:597"
```

### Step 3: Verify Success

1. Check the response status code
2. A `200` status code indicates successful cache invalidation
3. Verify the content change is now visible on the frontend
