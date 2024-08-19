# Event integration

Events make up an important part of the overall activities the Danish Public
Libraries. One business aspect of these events is ticketing. Municipalities
in Denmark use different external vendors for handling this responsibility
which includes functionalities such payment, keeping track of availability,
validation, seating etc.

On goal for libraries is to keep staff workflows as simple as possible and
avoid duplicate data entry. To achieve this DPL CMS exposes data and
functionality as a part of [the public API of the system](./architecture/adr-006-api-specification.md).

## Data synchronization

[The public API for DPL CMS is documented through an OpenAPI 2.0 specification](../openapi.json).

The following flow diagram represents a suggested approach for synchronizing
event data between DPL CMS and an external system.

<!-- markdownlint-disable MD013 -->
```mermaid
sequenceDiagram
  Actor EventParticipant
  Participant DplCms
  Participant ExternalSystem
  ExternalSystem ->> DplCms: Retrieve all events
  activate ExternalSystem
  activate DplCms
  DplCms ->> ExternalSystem: List of all publicly available events
  deactivate DplCms
  ExternalSystem ->> ExternalSystem: (Optional) Filter out any events that have not been marked as relevant (ticket_manager_relevance)
  ExternalSystem ->> ExternalSystem: Identify new events by UUID and create them locally
  ExternalSystem ->> DplCms: Update events with external urls
  ExternalSystem ->> ExternalSystem: Identify existing events by UUID and update them locally
  ExternalSystem ->> ExternalSystem: Identify local events with UUID which are<br/>not represented in the list and delete them locally
  deactivate ExternalSystem
  Note over DplCms,ExternalSystem: Time passes
  EventParticipant -->> DplCms: View event
  EventParticipant -->> DplCms: Purchase ticket
  DplCms -->> EventParticipant: Refer to external url
  EventParticipant -->> ExternalSystem: Purchase ticket
  activate ExternalSystem
  ExternalSystem -->> EventParticipant: Ticket
  ExternalSystem ->> DplCms: Update event with state e.g. "sold out"
  deactivate ExternalSystem
```
<!-- markdownlint-enable MD013 -->

## Authentication

An external system which intends to integrate with events is setup in the same
way as library staff. It is represented by a Drupal user and must be assigned
an appropriate username, password and role by a local administrator for the
library. This information must be communicated to the external system through
other secure means.

The external system must authenticate through [HTTP basic auth](https://swagger.io/docs/specification/2-0/authentication/basic-authentication/)
using this information when updating events.

## API versioning

Please read [the related ADR](./architecture/adr-011-api-versioning.md) for how
we handle API versioning.
