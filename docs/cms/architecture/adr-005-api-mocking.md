# Architecture Decision Record: API mocking

## Context

DPL CMS integrates with a range of other business systems through APIs. These
APIs are called both clientside (from Browsers) and serverside (from
Drupal/PHP).

Historically these systems have provided setups accessible from automated
testing environments. Two factors make this approach problematic going forward:

1. In the future not all systems are guaranteed to provide such environments
   with useful data.
2. Test systems have not been as stable as is necessary for automated testing.
   Systems may be down or data updated which cause problems.

To address these problems and help achieve a goal of a high degree of test
coverage the project needs a way to decouple from these external APIs during
testing.

## Decision

We use [WireMock](http://wiremock.org/) to mock API calls. Wiremock provides
the following feature relevant to the project:

- Wiremock is free open source software which can be deployed in development and
  tests environment using Docker
- Wiremock can run in HTTP(S) proxy mode. This allows us to run a single
  instance and mock requests to all external APIs
- We can use the [`wiremock-php`](https://github.com/rowanhill/wiremock-php)
  client library to instrument WireMock from PHP code. We modernized the
  [`behat-wiremock-extension`](https://github.com/danskernesdigitalebibliotek/behat-wiremock-extension/)
  to instrument with Behat tests which we use for integration testing.

### Instrumentation vs. record/replay

Software for mocking API requests generally provide two approaches:

- *Instrumentation* where an API can be used to define which responses will be
  returned for what requests programmatically.
- *Record/replay* where requests passing through are persisted (typically to the
  filesystem) and can be modified and restored at a later point in time.

Generally record/replay makes it easy to setup a lot of mock data quickly.
However, it can be hard to maintain these records as it is not obvious what part
of the data is important for the test and the relationship between the
individual tests and the corresponding data is hard to determine.

Consequently, this project prefers instrumentation.

## Alternatives considered

There are many other tools which provide features similar to Wiremock. These
include:

- [Hoverfly](https://docs.hoverfly.io/en/latest/): FOSS, Docker image and proxy
  support. [PHP](https://github.com/ns3777k/hoverfly-php)
  [clients](https://github.com/pachico/hoverphp) are less mature and no Behat
  integration.
- [Mountebank](http://www.mbtest.org/): FOSS and Docker image. No proxy support,
  [PHP client](https://packagist.org/packages/demyan112rv/mountebank-api-php)
  is less mature and no Behat integration.
- [MockServer](https://www.mock-server.com/): FOSS, Docker image and proxy
  support. No PHP client and no Behat integration.
- [Mockoon](https://mockoon.com/): FOSS and Docker image. Does not provide
  instrumentation.

## Consequences

- Developers may have to engage in maintenance of the `wiremock-php` and
  `behat-wiremock-extension` library

## Status

Instrumentation of Wiremock with PHP is made obsolete with [the migration from
Behat to Cypress](./adr-007-cypress-functional-testing.md).
