# Architecture Decision Record: Cypress for functional testing

## Context

DPL CMS employs functional testing to ensure the functional integrity of the
project.

This is currently implemented using [Behat](https://docs.behat.org/en/latest/)
which allows developers to instrument a browser navigating through different use
cases using [Gherkin](https://behat.org/en/latest/user_guide/gherkin.html), a
business readable, domain specific language. Behat is used within the project
based on experience using it from [the previous generation of DPL CMS](https://github.com/ding2/ding2).

Several factors have caused us to reevaluate that decision:

- [The Drupal community has introduced Nightwatch for browser testing](https://www.drupal.org/node/2869825)
- [Usage of Behat within the Drupal community has stagnated](https://packagist.org/packages/drupal/drupal-extension/stats)
- Developers within this project have questioned the developer experience and
  future maintenance of Behat
- Developers have gained experience using [Cypress](https://www.cypress.io/) for
  browser based testing of the [React components](https://danskernesdigitalebibliotek/dpl-react)

## Decision

We choose to replace Behat with Cypress for functional testing.

## Alternatives considered

There are other prominent tools which can be used for browser based functional
testing:

- [Playwright](https://playwright.dev/):
  Playwright is a promising tool for browser based testing. It supports many
  desktop and mobile browsers. It does not have [the same widespread usage as
  Cypress](https://2021.stateofjs.com/en-US/libraries/testing/).

## Consequences

- Although Cypress supports [intercepting requests to external systems](https://docs.cypress.io/api/commands/intercept)
  this only works for clientside requests. To maintain a consistent approach to
  mocking both serverside and clientside requests to external systems we
  integrate Cypress with Wiremock using a similar approach to what [we have done
  with Behat](./adr-005-api-mocking.md).
- There is [a community developed module which integrates Drupal with Cypress](https://www.drupal.org/project/cypress).
  We choose not to use this as it provided limited value to our use case and
  we prefer to avoid increased complexity.
- We will not only be able to test on mobile browsers as this is not supported
  by Cypress. We prefer consistency across projects and expected improved
  developer efficiency over what we expect to be improved complexity of
  introducing a tool supporting this natively or [expanding Cypress setup to
  support mobile testing](https://applitools.com/blog/cross-browser-tests-cypress-all-browsers/).
- We opt not to use Gherkin to describe our test cases. The business has
  decided that this has not provided sufficient value for the existing project
  that the additional complexity is not needed. [Cypress community plugins
  support writing tests in Gherkin](https://github.com/badeball/cypress-cucumber-preprocessor).
  These could be used in the future.
