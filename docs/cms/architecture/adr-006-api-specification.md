# Architecture Decision Record: API specification

## Context

DPL CMS provides HTTP end points which are consumed by the React components. We
want to document these in an established structured format.

Documenting endpoints in a established structured format allows us to use tools
to generate client code for these end points. This makes consumption easier and
is a practice which is already used with [other](https://github.com/danskernesdigitalebibliotek/dpl-react/blob/main/dbc-gateway.codegen.yml)
[services](https://github.com/danskernesdigitalebibliotek/dpl-react/blob/main/orval.config.ts)
in the React components.

Currently these end points expose business logic tied to configuration in the
CMS. There might be a future where we also need to expose editorial content
through APIs.

## Decision

We use the [RESTful Web Services Drupal module](https://www.drupal.org/docs/drupal-apis/restful-web-services-api/restful-web-services-api-overview)
to expose an API from DPL CMS and document the API using [the OpenAPI 2.0/Swagger
2.0 specification](https://swagger.io/specification/v2/) as supported by the
[OpenAPI](https://www.drupal.org/project/openapi) and [OpenAPI REST](https://www.drupal.org/project/openapi_rest)
Drupal modules.

This is a technically manageable, standards compliant and performant solution
which supports our initial use cases and can be expanded to support future
needs.

## Alternatives considered

There are two other approaches to working with APIs and specifications for
Drupal:

- [JSON:API](https://jsonapi.org/):
  [Drupals JSON:API module](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/api-overview)
  [provides many features over the REST module](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/jsonapi-vs-cores-rest-module)
  when it comes to exposing editorial content (or Drupal entities in general).
  However it does not work well with other types of functionality which is what
  we need for our initial use cases.
- [GraphQL](https://graphql.org/):
  GraphQL is an approach which does not work well with Drupals HTTP based
  caching layer. This is important for endpoints which are called many times
  for each client.
  Also from version 4.x and beyond the [GraphQL Drupal module](https://www.drupal.org/project/graphql)
  provides no easy way for us to expose editorial content at a later point in time.

## Consequences

- This is an automatically generated API and specification. To avoid other
  changes leading to unintended changes this we keep the [latest version of the
  specification](/openapi.json) in VCS and [setup automations to ensure that the
  generated specification matches the inteded one](/.github/workflows/ci-tests.yml).
  When developers update the API they have to use [the provided tasks](/Taskfile.yml)
  to update the stored API accordingly.
- OpenAPI and OpenAPI REST are Drupal modules which have not seen updates for a
  while. We have to apply patches to get them to work for us. Also they do not
  support the latest version of the OpenAPI specification, 3.0. We risk
  increased maintenance because of this.
