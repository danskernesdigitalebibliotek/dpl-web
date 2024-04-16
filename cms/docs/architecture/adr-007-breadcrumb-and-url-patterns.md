# Architecture Decision Record: Breadcrumb structure & URL patterns

## Context

The tagging system we have (tags & categories) considers content as 'islands':
Two peices of content may be tagged with the same, but they do not know about
each other.

DDF however needs a way to structure content hierarchies.
After a lot of discussion, we reached the conclusion that this can be
materialized  through the breadcrumb - the breadcrumb is basically the frontend
version of the content structure tree that editors will create and manage.

Because of this, the breadcrumb is "static" and not "dynamic" - e.g., on some
sites, the breadcrumb is built dynamically, based on the route that the user
takes through the site, but in this case, the whole structure is built by
the editors.

However, some content is considered "flat islands" - e.g. articles and events
should not know anything about each other, but still be categorized.

Either way, the breadcrumb also defines the URL alias.

## Decision

There are two types of breadcrumbs:

- Category-based
  - Articles and events can be tagged with categories. These categories may
  - have a hiarchy, and this tree will be displayed as part of the article
  - breadcrumb.
- Content Structure
  - A custom taxonomy, managed by webmasters, where they choose "core-content
    references". This builds the tree.
  - When creating non-core pages, there is a field that the editor can choose
    where this page "lives" in the structure tree.
  - Based on this, the breadcrumb will be built.

All of this is managed by `dpl_breadcrumb` module.

## Alternatives considered

We tried using menus instead of taxonomy, based on experience from another
project, but it caused too much confusion and a general poor admin experience.
More info about
[that in the ticket comments:](https://reload.atlassian.net/browse/DDFFORM-471?focusedCommentId=111572)

## Consequences

A functional breadcrumb, that is very hard to replace/migrate if we choose a
different direction.
