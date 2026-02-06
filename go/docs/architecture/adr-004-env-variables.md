# Env variables

## Context

We needed unified way to handle type safe environment variables in our application.
We often ran into issues where the application would break because of missing
environment variables, but it was not obvious which one.
By using our own configuration system we can validate the environment variables
on startup and get a clear error message with the name of the environment variable
that is missing. This also gives autocompletion and we can catch any accidental
renaming of environment variables.

## Decision

We decided to make two helpers for getting environment variables:

- `getEnv` for getting public environment variables on both the server and the client
- `getServerEnv` for getting sensitive server-only environment variables

By using Zod we can define a schema for the environment variables and what content we expect of them.

A new environment variable can be added by adding it to the `getEnvs` function and then extending the `EnvSchema` or `EnvServerSchema` with the new variable.

Example:

```typescript
function getEnvs() {
  return {
    NEW_ENV: process.env.NEXT_PUBLIC_NEW_ENV,
    SOME_API_KEY: process.env.SOME_API_KEY,
  }
}
```

```typescript
const EnvSchema = z.object({
  NEW_ENV: z.string().refine(validateUrl), // validates that the env is a valid url
})
```

and

```typescript
const EnvServerSchema = z.object({
  SOME_API_KEY: z.string().optional(), // use optinal if the variable can be omitted - like in cases where we override fetched config
})
```

Then use it in your code like this:

```typescript
const apiKey = getServerEnv("SOME_API_KEY")

const result = await fetchDataFromExternalAPI(apiKey)
```

and

```typescript
console.log(getEnv("NEW_ENV"))
```

## Alternatives considered

We did not look into alternatives.

## Consequences

With the new helper functions it is crucial that we no longer use `process.env` directly in our code.
As this would defeat the purpose of having a type safe system.
