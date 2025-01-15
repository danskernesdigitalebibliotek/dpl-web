# Configuration

## Context

We have several places where configuration come from:

- Environment variables
- Configuration from external API's
- Static local configuration

We wanted a unified way of handling configuration that addresses those (and
possibly future) configuration sources.
The reasons why is listed in the "Consequences" section of this document.

## Decision

We decided to make our own configuration system that uses a plugin-system we
call resolvers. They are placed in our centralized directory `lib` directory:
`/lib/config/resolvers`.

A resolver can either be a flat value like:

```typescript
const search = {
  "search.item.limit": 12,
  "search.offset.initial": 0,
  "search.param.initial": 0,
  "search.facet.limit": 100,
...
```

...or a function:

```typescript
{
  "service.fbi.graphql.endpoint": () => {
    if (process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_FBI) {
      return process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_FBI
    }
  },
}
```

...or even a asynchronous function:

```typescript
{
  "service.unilogin.api.url": async () => {
    if (process.env.UNILOGIN_API_URL) {
      return process.env.UNILOGIN_API_URL
    }

    const config = await getDplCmsUniloginConfig()
    if (config?.unilogin_api_url) {
      return config?.unilogin_api_url
    }
  },
}
```

NOTE:

With configuration that is coming from an asynchronous resolver function and is dependant
on external systems you MUST specify an environment variable that possibly can
overwrite what is coming from outside (like in the async example).

In that way it is possible in eg. in tests, development and CI to overwrite the configuration.

## Alternatives considered

We did not look into alternatives.

## Consequences

With the new configuration system we:

- Do not need to know where the configuration comes from when we refer it.
- Can have one place where we control the error handling
- The configuration is typed so we know what is available
