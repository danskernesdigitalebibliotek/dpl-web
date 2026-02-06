# Server side mocking

## Context

We needed to find a good way to handle server side mocking as a part of Cypress tests in Nextjs.
The goal was to have a tool which could intercept requests made from server side functions, which could not be intercepted with cy.intercept()
It should be possible to write custom intercept commands directly in a Cypress test and use a Fishery factory for its response data.
It was a must that the tool could intercept both REST, SOAP and GraphQL requests.

## Decision

MockTTP is a byproduct of the Open Source software HTTP Toolkit, which allows very advanced request intercept and rewrites.
MockTTP can be run inside Node.js and change response output on the fly, which makes it a good option, because it allows different responses to the same endpoint while running a Cypress test.

## Usage

While some tools listens for all requests in the mocked application, MockTTP rely on requests to be routed through its HTTP server, which is available on port 9000 after starting the server.

Using the mock server directly (MockApiServer()) should not be needed, as a range custom Cypress commands has already been defined.
These should cover most use cases when used together with Cypress.

MockTTP will startup together with Cypress on `yarn cypress:open`, and any handled or unhandled request will be logged to the console.

Example:

```typescript
// intercept server side GraphQL Query with a matching operation name
// return response as Fishery factory
cy.mockServerGraphQLQuery({
  operationName: "getAdgangsplatformenLibraryToken",
  data: GetAdgangsplatformenLibraryToken.build(),
})
```

```typescript
// intercept server side POST request on matching path (ignores any query params)
// return response as Fishery factory
cy.mockServerRest({
  method: "POST",
  path: "/introspect",
  data: introspection.build(),
})
```

## Alternatives considered

As a part of choosing MockTTP, the more widely used and known package MSW was also tested.
After discovering that MSW works very poorly with Nextjs, as it only intercept some requests, we decided to look elsewhere.
https://github.com/mswjs/examples/pull/101

## Consequences

MockTTP is unfortunately not a very well-documented tool, as its intended use is mostly as a part of HTTP Toolkit.
It does have some well-defined functions and type safety, but don't expect any thorough API documentation.
