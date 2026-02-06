# Architecture Decision Record: API versioning

## Context

DPL CMS exposes data and functionality through HTTP endpoints which are
documented by [an OpenAPI specification](../../openapi.json) as described in
[a previous ADR](adr-006-api-specification.md).

Over time this API may need to be updated as the amount of data and
functionality increases and changes. Handling changes is an important aspect
of an API as such changes may affect third parties consuming this API.

## Decision

We use [URI versioning](https://restfulapi.net/versioning/) of the API exposed
by DPL CMS.

This is a simple approach to versioning which works well with the
[RESTful Web Services Drupal module](https://www.drupal.org/docs/drupal-apis/restful-web-services-api/restful-web-services-api-overview)
that we use to develop HTTP endpoints with. Through the specification of the
paths provided by the endpoints we can define which version of an API the
endpoint corresponds to.

### Breaking changes

When a breaking change is made the version of the API is increased by one e.g.
from `/api/v1/events` to `/api/v2/events`.

We consider the following changes breaking:

1. Adding required request parameters to HTTP endpoints
2. Removing functionality of an endpoint (e.g. an HTTP method or request
   parameter)
3. Removing an exiting data field in response data
4. Updating the semantics of an existing data field in response data

The following changes are not considered breaking:

1. Adding optional request parameters
2. Adding additional data fields to existing structures in response data

The existing version will continue to exist.

## Alternatives considered

### Header based versioning

[Header based versioning](https://restfulapi.net/versioning/) is used by
[other systems exposing REST APIs](https://github.com/danskernesdigitalebibliotek/ddb-material-list)
in the infrastructure of the Danish Public Libraries. However we cannot see
this approach working well with the [RESTful Web Services Drupal module](https://www.drupal.org/docs/drupal-apis/restful-web-services-api/restful-web-services-api-overview).
It does not deal with multiple versions of an endpoint which different
specifications.

### GraphQL

[Versionless GraphQL APIs are a common practice](https://graphql.org/learn/best-practices/#versioning)
[Drupal can support GraphQL through a third party module](https://www.drupal.org/project/graphql)
but using this would require us to reverse our approach to API development and
specification.

## Consequences

Based on this approach we can provide updated versions of our API by leveraging
our existing toolchain.
