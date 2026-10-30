const caching = {
  "caching.dpl-cms.cachetags-header": "x-dpl-graphql-cache-tags",
  // Umbrella tags carried by every CMS-driven "use cache" entry, on top of the
  // per-node tags from the cachetags header. A single revalidation of one of
  // these drops all content or all config at once - the CMS "Clear Go cache"
  // button relies on this. These literals are a contract with the CMS
  // (dpl_go's GoRevalidator sends the same strings).
  "caching.dpl-cms.content-tag": "dpl-cms-content",
  "caching.dpl-cms.config-tag": "dpl-cms-config",
}

export default caching
