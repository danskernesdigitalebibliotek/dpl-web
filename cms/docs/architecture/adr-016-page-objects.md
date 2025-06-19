# Architecture Decision Record: Page objects in Cypress E2E tests

## Context

Cypress tests of anything but the simplest pages can quickly become
large, difficult to follow and repetitive across tests. It's difficult
to separate the important steps from the implementation details.

## Decision

We've decided to go with the Page Object Model. It's an established
model that's proven its worth.

It provides an abstraction for working with pages in tests that moves
the implementation details of pages from the test to the page object,
and allows for writing your test in a language that's closer to the
users mental model.

A [guide](../page-objects.md) for usage and implementation has been
added.

## Consequences

* Abstracting the page details away from the test and into the page
  object makes the focus of the test more clear.
* Page objects are reusable across tests, this reduces duplication and
  the amount of test code that needs to be updated when refactoring.
* Abstractions are not free, it does add a bit more work for the
  simple case of pressing a button or asserting the contents of a
  `<div>`.

## Alternatives considered

We started out by splitting out abstractions of user actions into
functions. Cypress developers themselves suggests essentially the same
thing, but using actions, which makes the functions available on the
`cy` object.

The issue with this approach is that it lacks structure and
abstraction. Every action is part of a global namespace, but only a
subset of actions is applicable on a given page.

Secondly it provides no pattern for getting information from a page. A
given test needs to know the exact implementation of a page it
interacts with, regardless of whether that page is actually the focus
or the test or only used in the process of testing another component.

One might attempt to fix these issues with naming conventions for
actions and data fetching helpers, but that's basically just trying to
implement POM without the O.
