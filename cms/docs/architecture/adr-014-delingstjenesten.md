# Architecture Decision Record: Delingstjenesten

## Context

Delingstjenesten wants to implement a content sharing site for the
libraries to promote content reuse and help smaller libraries with
limited content production resources.

The major use-cases is:

* Give editors on libraries the option to easily import produced
  content (articles, news items) from Delingstjenesten into their
  site.
* Give editors the option to share specific content on their site with
  the community at large, through Delingstjenesten.
* A subscription feature that allows editors to get a steady flow of
  automatically published selected content.

BNR (Bibliotekernes Nationale Redaktion, the content editors of the
Delingstjenesten site) wishes to enrich and QA submitted content
before making it generally available.

## Decision

Delingstjenesten is built on top of DPL CMS, the advantage of this is
twofold: Technically it avoids having to recreate and maintain copies
of the content structures of DPL CMS, secondly it allows BNR to use
DPL CMS features to set up the site as a showroom for the content.

### Architecture

The system works with as little stored data as possible to avoid
configuration and data that can be out of sync. Delingstjenesten does
not have a list of client sites, but talks with anyone that provide
the right credentials and a reachable URI.

The client sites keeps track of their subscriptions themselves and
periodically asks Delingstjenesten for updates. A subscription is
represented on the library site by an entity that contains the UUID of
the term on Delingstjenesten that's subscribed to, and which local
terms to assign to content imported through this subscription.

Communication between the library sites and Delingstjenesten is done
using GraphQL, using a combination of queries and mutations.

## Alternatives considered

Alternatives to GraphQL was briefly considered, but as the GO project
relies heavily on GraphQL, and there is some talk about moving the
existing REST services to GraphQL, it was decided to stick to one
technology for everybody's sanity's sake.

## Future considerations

The Sailor GraphQL PHP client generator that's currently used to
generate a strongly typed client doesn't recognize when the same types
is used across the API. This means that the same type is represented
by different classes across operations, paragraphs and nodes, which
makes the mapping unnecessarily convoluted and have resulted in some
un-GraphQL-like queries to work around.

Finding/building a client generator without this limitation would
simply the mapping of data significantly and allow for better usage of
GraphQL.
