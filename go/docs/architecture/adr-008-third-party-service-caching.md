# 3rd Party Service Cache Handling in Go

## Context

We wanted to address performance concerns by speeding up the delivery of data
and thereby improve the user experience.

## Decision

Go fetches data from several 3rd party services, and all the requests uses the
React Query QueryClient - either server side or client side.

Both query clients make use of the function `getQueryClientStaleTime()` which is,
at the moment of this writing, set to **1 minute**.
Unless the queryclient is told to invalidate certain query keys the cache will
live for that amount of time.

## Usage

### Implementation Examples

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
// Publizon get user loans example
const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()
```

### Cache Invalidation

#### Manual Invalidation

```typescript
// In React Query
queryClient.invalidateQueries({ queryKey: getGetV1UserLoansAdapterQueryKey() })
```

## Alternatives considered

We could make use of the cache mechanisms in NextJs. But we like the ease of
defining the cache once at the Query Client level and let React Query handle the
rest.

## Consequences

The lifetime of the cache implemented in React Query is very low. The cache is
primarily added in order to improve the performance for the end user because we
do not have specific demands from the service providers to keep the request
frequency low.

Although we have a short cache life time on the 3rd party services, we should be
aware of invalidating the relevant cache(s) upon data mutations and on log out,
to keep data fresh.
