# Architecture Decision Record: Links between Go and CMS

## Context

The Go site (for kids) and the regular CMS appear to users as two
sites with their own URLs, but in reality all content is in the same
Drupal instance, with Go having its own React frontend.

The regular CMS doesn't render Go node types very well, and the Go
front-end can't render CMS node types at all, but per default all
links "between sites" is rendered as local links.

So there's a need to ensure that content is shown on the correct
"site".

This is complicated by the fact that figuring out which "site" the
current request is servicing isn't obvious.

## Decision

By leveraging Drupals `PathProcessor` system, we can ensure that links
in link fields and WYSIWYG field (via the `linkit` module) gets
rendered as external links to the correct site.

The `PathProcessor` intercepts all `/node/<nid>` links (before alias
processing), and checks the node content type to determine if it
should be left internal or externalized. If it needs to be external,
it simply sets the `base_url` property to the relevant site.

This is basically how the domain language negotiation plugin in Drupal
core implements links between language versions, so the method should
be fairly safe.

What "site" we're on is determined by checking the `rewrite go urls`
permission, which is only given to the `go_graphql_client` role which
in turn is only given to the `go_graphql` user that's used for the Go
GraphQL consumer.

This is because "being on the Go site" is defined as GraphQL requests
from the React front-end. When this is not the case it's assumed to be
a CMS request.

## Consequences

Drupal user 1 isn't able to use the Go front-end, as the link logic
will be reversed. This is because user 1 is explicitly excluded from
the above check, as user 1 always gets all permissions. This is purely
a theoretical limitation, user 1 isn't able to log into the Go site as
it uses Unilogin for authentication.

Currently it only affects the base part of the URL and assumes that
the path itself it the same across the sites. Which is a reasonable
assumption as it *is* the same site, but it means that the sites share
a path namespace.

## Alternatives considered

Different approaches was considered but rejected, some only covering
part of the problem space.

### Redirects and extra GraphQL fields

Instead of rewriting paths, simply redirect all requests for Go
content types to the Go counterpart on the CMS site, and adding an extra
field to the `Link` type in GraphQL to inform the Go front-end that a
link is to the CMS.

1. Extra requests.
2. Go front-end would have to be adapted to deal with three different
   link types, internal, external and internal-but-external.
3. WYSIWYG fields would need special care.

### Use a /go prefix

Keep all Go pages under `/go`.

1. Doesn't look good.
2. Front-end still needs to deal with two different types of internal
   links.
