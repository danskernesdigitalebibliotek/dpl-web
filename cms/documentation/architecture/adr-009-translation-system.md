# Architecture Decision Record: Translation system

## Context

A new way of handling translations for dpl-cms was requested.
Instead of the former workflow where .po files were passed around
there was a wish for a centralized way of handling translation
with an automatic distribution of translated strings.

## Decision

We ended up using [POEditor](https://poeditor.com) as the translation admin hub
with .po files committed to the repo.
A Github action workflow controls the traffic when changes are pushed
to the .po files either by a Github action step or by a push from POEditor.

## Alternatives considered

Using dpl-cms as translation hub in a separate environment in Lagoon.

## Consequences

Now it is possible in a centralized way to administer the translations.
It is also possible to update every library site and get the newest
translations without deployment.

As a bonus we do not need to maintain the translation interface ourselves.

### Potion

For covering the functionality of scanning the code we had two possibilities:

* Finding a contrib module that could do it
* Code it ourselves

We normally choose, if possible, to go for a community backed project because
we can get the benefit of having contributors working on issues
and unforeseen problem scopes has maybe already been solved.
So we went for the first option.

After some research and trials we ended op having two potential project that
could solve the case:

* [Potion](https://www.drupal.org/project/potion)
* [Potx](https://www.drupal.org/project/potx)

Both projects can scan the codebase and generate a .po or .pot file with the
translation strings and context.

At first it made most sense to go for Potx since it is used by
[localize.drupal.org](https://localize.drupal.org) and it has a long history.
But Potx is extracting strings to a .pot file without having the possibility
of filling in the existing translations.
So we ended up using Potion which can fill in the existing strings.

A flip side using Potion is that it is not being maintained anymore.
But it seems quite stable and a lot of work has been put into it.
We could consider to back it ourselves.
