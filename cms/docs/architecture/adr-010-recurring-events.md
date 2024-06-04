# Architecture Decision Record: Recurring events

## Context

Events make up an important part of the overall activities the Danish Public
Libraries. They aim to promote information, education and cultural activity.
Events held at the library have many different formats like book readings,
theater for children, tutoring and exhibitions of art. Some of these events
are singular and some are recurring.

We define a recurring event as an event that occurs more than once over the
course of a period of time where the primary different between each occurrence
of the event is the event start and end time.

A simple solution to this would be to use a multi-value date range field but
there are a number of factors that makes this more challenging:

### Functional requirements

- **Schedules**: Editors would like to create occurrences based on a schedule
  e.g. every Tuesday from 15:00 to 17:00 between January 1st and March 31th.
  This is simpler than having to set each date and time manually.
- **Reuse**: Editors would like to avoid having to retype information for each
  instance if it does not wary.
- **Exceptions**: Editors need to be able to create exceptions. An event might
  not occur during a holiday.
- **Variatons**: Occurrences may have variations between them. If attendance
  requires a ticket, then each occurrence should have a unique url to buy
  these. An occurrence can also be marked as sold out or cancelled. This is
  preferable to deleting the instance for the sake of communication to end
  users.
- **Relationships**: End users would like to a see the relationship between
  occurrences. If the date of one occurrence does not fit their personal
  schedules it is nice to see the alternatives.
- **Instances in lists**: End users should be able to see individual
  occurrences in lists. If an event occurs every Tuesday and the end user
  scrolls down a list of events then the event should be presented on every
  Tuesday so the end user can get a clear picture of what is going on that day.

### Other qualities

- **Editorial user experience**: Creating schedules can be complex. Editors
  should be able to do this without being confronted with fields that are hard
  to understand or seem unnecessary.
- **Maintenance**: If we base a solution on third party code we need to
  consider future maintenance.

## Decision

We have decided to base our solution on the [Recurring Events Drupal module](https://www.drupal.org/project/recurring_events).

The purpose of the module overlaps with our need in regards to handling
recurring events. The module is based on a construct where a recurring event
consists of an event series entity which has one or more related event
instances. Each instance corresponds to an specific date when the event
occurs.

The module solves our requirements the following way:

### Schedule

The module supports creating shedules for events with daily, weekly, monthly,
and annual repetitions. Each frequency can be customized, for example, which
days of the week the weekly event should repeat on (e.g., every Tuesday and
Thursday), which days of the month events should repeat on (e.g., the first
Wednesday, the third Friday).

### Reuse

Event series and instances are fieldable entities. The module relies on the
[Field Inheritance Drupal module](https://www.drupal.org/project/field_inheritance)
which allows data to be set on event series and reuse it on individual
entities.

### Exceptions

Recurring events support exceptions in two ways:

1. Editors can delete individual instances after they have been created,
2. Editors can create periods in schedules where no instances should be created.
   Such periods can also be created globally to make them apply to all series.
   This can be handy for handling national holidays.

### Variations

The Field Inheritance module supports different modes of reuse. By using the
*fallback* method we can allow editors override values from event series on
individual instances.

### Relationships

Recurring events creates a relationship between an event series and individual
instances. Through this relationsship we can determine what other instances
might be for an individual instance.

### Instances in lists

It is possible to create lists of individual instances of events using Views.

### Editorial user experience

Recurring events uses a lot of vertical screen real estate on form elements
needed to define schedules (recurrence type, date/time, schedule, excluded
dates).

The module supports defining event duration (30 minutes, 1 hour, 2 hours).
This is simpler than having to potentially repeat date and time.

### Maintenance

Recurring events lists six maintainers on Drupal.org and is supported by
three companies. Among them is Lullabot, a well known company within the
community.

The module has over 1.000 sites reported using the module. The latest
version, 2.0.0-rc16, was recently released on December 1th 2023.

The dependency, Field Inheritance, currently requires two patches to
Drupal Core.

## Consequences

By introducing new entity types for event series and instance has some
consequences:

- All work currently done in relation to event nodes have to be migrated to
  event series and/or instances.
- We cannot use modules which only work with nodes. Experience shows that
  such modules have been gradually replaced by modules which work with all
  entities. Examples include modules like [Entity Clone](https://www.drupal.org/project/entity_clone)
  and [Entity Queue](https://www.drupal.org/project/entityqueue).
- We cannot use the Drupal Core Views module to create lists of content which
  combine nodes like articles and events. To address this need we can use
  [Search API](https://www.drupal.org/project/search_api) which supports
  creating indices and from these, views, across entity types. We are planning
  to use this module anyway.

For future work related to events we have to consider when it is appropriate to
use event series and when to use event instances.

To create a consistent data structure for events we have to use recurring
events - even for singular events.

We may have to do work to improve the editorial experience. This should
preferably be upstreamed to the Recurring Events module.

Going forward we will have to participate in keeping Field Inheritance patches
to Drupal Core updated to match future versions until they are merged.

## Alternatives considered

In the process two alternative Drupal modules were considered:

- **[Smart date](https://www.drupal.org/project/smart_date)**: This was heavily
  considered due to good editorial experience and maintenance status. The module
  also shows promise in regard to handling opening hours for libraries. For
  recurring events the module was eventually discarded due to lacking support
  for variations out of the box.
- **[Entity repeat](https://www.drupal.org/project/entity_repeat)**: This was
  ruled out due to lack of relationship between event instances, poor editorial
  experience and worrying outlook regading maintenance (very small user base,
  no official Drupal 10 version)
