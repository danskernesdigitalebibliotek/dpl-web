// Umbrella cache tags applied to every CMS-driven `"use cache"` entry, on top
// of the per-node tags the CMS sends in its `x-dpl-graphql-cache-tags` header.
//
// Next's `"use cache"` entries can only be invalidated by tag, never by a path
// revalidation, and the per-node tags differ per page. These shared tags are
// therefore the only way to drop *all* content or *all* config in a single
// call - which is what the CMS "Clear Go cache" button relies on
// (/cache/revalidate?tags=dpl-cms-content,dpl-cms-config).

// Carried by every cached CMS content page (article, category, basic page,
// category slider).
export const DPL_CMS_CONTENT_CACHE_TAG = "dpl-cms-content"

// Carried by the cached goConfiguration (public and private).
export const DPL_CMS_CONFIG_CACHE_TAG = "dpl-cms-config"
