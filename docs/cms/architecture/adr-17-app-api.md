# Mobile app support endpoints

## Context

The mobile apps relies on fetching content and other data from the
CMS. Historically this has been done using GraphQL and the standard
queries provided by the `graphql_compose` module.

This approach results in an opaque coupling between the mobile app and
the content model of the CMS. As the GraphQL schema produced by
`graphql_compose` changes when content types, paragraph and fields are
changed in Drupal, this can inadvertently break clients when changing
things in the CMS.

Secondly, as it's up to the client what it queries using GraphQL, CMS
developers has no idea what it depends on, so they have no way to
mitigate these kinds of problems.

## Decision

By creating custom queries in the `dpl_app` module, the requirements
of the mobile apps is materialized in the CMS.

Instead of exposing nodes with paragraphs, the module provide app
specific types like `AppPage` and `AppElement` which doesn't
necessarily map directly to nodes and paragraphs, but better fit the
content model of the mobile apps.

This couples the mobile apps with the queries provided by the
`dpl_app` module, instead of some (to the CMS developers) unknown
subset of the total of the Drupal content model.

1. From the perspective of the CMS, there's a contract as to what data
   the mobile apps depends on, an CMS developer does not have to think
   about what a given change to a field might mean to the mobile app,
   if it's obvious from `dpl_app` that the field is not used.
2. The mobile apps does not have to deal with the specific content
   structure of the CMS (such as the fact that a image attached to a
   node is is a field that references a media entity with a field thot
   references a file), but can get the exact data they need (the URL
   of the image).
3. As a happy side effect, there's a conversation about what data the
   mobile apps need, and doesn't need.

## Alternatives considered

### Do nothing

The status quo have been tried, and at least on one occasion a CMS
change broke the old mobile app.

### Enforcing backwards compatibility

Sticking with the `graphql_compose` generated queries, but requiring
any changes that would change the GraphQL schema to add in the
required compatibility code to ensure that that the existing schema
isn't changed, but only added to, was considered.

While this would be more in the spirit of GraphQL, it's deemed too
much of a burden for the CMS developers as it in practice would
require them to ensure backwards compatibility in a very large API for
each and every change even though 95% of the API isn't used by anyone.

## Consequences

There's a development effort for anything the mobile apps needs, and
there's a need for communication between the app and CMS teams about
what's needed. The former is considered a small price to pay for the
improved robustness and the latter is good for the project at large.
