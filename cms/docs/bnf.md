# Bibliotekernes Nationale Formidling

Bibliotekernes Nationale Formidling (henceforth "BNF") is a national
team handling sharing of content for libraries. The `bnf_server` and
`bnf_client` modules support their work.

## Server module

The server module is enabled on the main BNF site, which acts as a hub
for content sharing. The BNF team uses this site to create and edit
content provided for the libraries.

## Client module

The client module is enabled on library sites and handles pushing and
fetching content to/from the BNF site.

## Overview

BNF support sharing of content in to ways:

1. Manually, by browsing
   [Delingstjenesten](https://delingstjenesten.dk/) and manually
   picking content to import to the local library site.
2. Through subscriptions where new content from
   [Delingstjenesten](https://delingstjenesten.dk/) is automatically
   imported to the local library. These can be created by visiting a
   term listing page on
   [Delingstjenesten](https://delingstjenesten.dk/) and opting to
   subscribe to the term.

A node that has been imported is automatically updated with updates
from [Delingstjenesten](https://delingstjenesten.dk/), but the local
editor can opt to turn off updates for individual nodes. This is
required if they want to change the content, in order to avoid having
overwritten by an upstream update.

## The nitty gritty details

The `bnf` module adds three fields nodes, one containing the
synchronization state (imported/exported/none), last source changed
timestamp, the name of the source and which subscription(s) (if any)
it was imported through..

When synchronizing a node, the nodes UUID is preserved, so content
thus shared has the same UUID on all sites regardless of what node ID
they happen to get. This means we don't have to maintain a NID mapping
in order to keep track of which node corresponds to which on
delingstjenesten.dk or the client sites.

Subscriptions is an entity defined by the `bnf_client` module. A
subscription has an UUID, a label (for display purposes), the UUID of
a taxonomy term on delingstjenesten.dk, optional categories and
tags to associate created content with, and a timestamp for the newest
imported node.

### The UI

The actual UI parts of BNF is minimal. Client side there's a button to
"log in" on delingstjenesten.dk, which sends the user to the BNF site
and adds buttons to nodes and taxonomy terms to import nodes and
create subscriptions.

In reality the library doesn't log into delingstjenesten.dk, the "Log
in" link simply redirects to delingstjenesten.dk with some parameters
that tells the BNF site where they're coming from, which is then
associated with that anonymous user session.

The import and subscribe buttons are equally simple, they simply
redirect back to the client site with an UUID, and the client module
then initiates synchronization/subscription creation.

On the client site there's an administration page for subscriptions.

On delingstjenesten.dk there's no real UI for the editorial team. They
simply use the same editorial tools for content as if the site was a
regular library.

### Synchronization

The synchronization process is handled by cron and queues on the
client side, and is done over GraphQL. There's two queues: One that
re-synchronizes existing nodes when they're updated, and one that asks
for new content on subscriptions and creates new nodes.

The node synchronization code uses the node query endpoints provided
by the `graphql_compose` module to fetch the node data. We use the
Sailor GraphQL client generator tool to generate a client with
response classes in `Drupal\bnf\GraphQL\Operations`.

This provides us with a typed response to queries. We then pass these
response objects to `BnfMapperManager`, which tries to find a mapper
plugin that handles the given response class. These mapper classes
might in turn call the manager to map other mappers recursively. For
instance, the `NodeArticleMapper` knows to pass the objects of the
`field_paragraphs` field to the manager to get the individual
paragraphs mapped.

This process maps the responses back to node object that's then saved
locally.
