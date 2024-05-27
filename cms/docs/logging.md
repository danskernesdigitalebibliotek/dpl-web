# Logging

We use logging to provide visibility into application behavior and related
user activitiesm to supports effective troubleshooting and debugging.
When an error or issue arises, logs provide the context and history to help
identify what went wrong and where.

## Architecture

We use [the logging API provided by Drupal Core](https://www.drupal.org/docs/8/api/logging-api/overview)
and rely on [third party modules](https://www.drupal.org/project/jsonlog) to
expose log data to [the underlying platform](https://github.com/danskernesdigitalebibliotek/dpl-platform/)
in a format that is appropriate for consumption by the platform.

## Logged events

We log the following events:

- Significant events occurring during the execution of the content management
  system relating to usage and background events. Examples include:
  - Scheduling of unpublication of events
  - Renewal of security tokens
- Error conditions during the execution of the project codebase. Examples
  include:
  - Inability to retrieve data from external systems
  - Invalid data provided by external systems
  - Unexpected state of the local system
- Events triggered by Drupal Core and other third party modules used in the
  system. Examples include:
  - User logins
  - Creation, editing and deletion of content
  - Execution of background processes

The architecture of the system, where self-service actions carried out by
patrons is handled by [JavaScript components running in the browser](https://github.com/danskernesdigitalebibliotek/dpl-react),
means that searching for materials, management of reservations and updating
patron information cannot be logged by the CMS.

## Logged data

Each logged event contains the following information by default:

- A message specified by the developer in the source code. Examples:
  - "Session closed for [editorial user]"
  - "Finished processing scheduled jobs ([time spent] sec, [number of jobs]
    total, [number of failures] failed)"
- The log severity specified by the developer in the source code.
- The date and time the event occurred
- Context added by default by Drupal if available for the actor (end user
  or external system) when the event occurred:
  - The associated Drupal user account (anonymized for patrons)
  - Url accessed
  - Referring url
  - IP address

In general sensitive information (such as passwords, CPR-numbers or the like)
must be stripped or obfuscated in the logged data. This is specified by our
[coding guidelines](code-guidelines.md#error-handling-and-logging). It is the
responsibility of developers to identify such issues during development and
peer review.

The architecture of the system severely limits the access to sensitive data
during the execution of the project and thus reduces the general risk.

## Log severities

The system uses the eight log severities specified by [PHP-FIG PSR-3](https://www.php-fig.org/psr/psr-3/)
and [Syslog RFC5424](https://datatracker.ietf.org/doc/html/rfc5424) as provided
by the Drupal logging API.

Events logged with the severity error or higher are monitored at the platform
level and should be used with this in mind. Note that Drupal will log unchecked
exceptions as this level by default.
