# Event field configuration

We use [the Recurring Events and Field Inheritance modules to manage events](architecture/adr-010-recurring-events.md).
This creates two fieldable entity types, `eventseries` and `eventinstance`,
which we customize to our needs. Both entity types use a single bundle
called `default`. We try to follow a structured approach when setting up
fields between the two entities.

## Why fields are duplicated

Most event fields exist twice: once on the series (where the editor sets a
default value that applies to every instance) and once on the instance
(initially empty, so it can fall back to the series). When the editor wants
a single occurrence to differ — for example, a one-off cancellation message
or a unique ticket link — they fill in the field on the instance, and that
value overrides the series value. This pattern is implemented by the
Field Inheritance module's *Fallback* strategy, and the instance-side field
must be optional for the fallback to take effect.

## Howto

### Create a new event field

1. Add a new field on the `eventseries` entity on `/admin/structure/events/series/types/eventseries_type/default/edit/fields`
2. Add a new field on the `eventinstance` entity on `/admin/structure/events/instance/types/eventinstance_type/default/edit/fields`.
3. Reuse all configuration from the field on `eventseries` including type,
   label, machine name, number of values etc.
   **Exception**: The field on the `eventinstance` entity must *not* be
   required. Otherwise the Fallback strategy will not work.
4. Add field inheritance from `eventseries` to `eventinstance` on `/admin/structure/field_inheritance`
   with the label "Event [field name]" e.g. "Event tags" and the "Fallback"
   inheritance strategy.
5. Use `eventseries`, `default` and the machine name for the field as the
   source.
6. Use `eventinstance`, `default` and the machine name for the field as the
   destination.

> **Special case — `title`.** The series uses Drupal's built-in `title`
> base field, while the instance uses a custom `field_event_title`. The
> corresponding inheritance record (`eventinstance_default_title`) therefore
> maps `title` → `field_event_title` and uses the `default_inheritance`
> plugin rather than the type-specific plugin used by other fields. You do
> not need to recreate this pattern for new fields — only be aware of it
> when reading existing configuration.

> **Heads up — location fields.** `dpl_event_entity_presave()` clears or
> normalises several location fields (`field_event_location`,
> `field_event_address`, `field_event_place`, `field_event_non_branch_location`)
> depending on the values of `field_event_location_type` and
> `field_branch`. If you add a new field that participates in event
> location handling, check that hook to see whether it needs the same
> treatment.

### Render a new field

1. Configure the display of the field for `eventseries` on `/admin/structure/events/series/types/eventseries_type/default/edit/display`
2. Configure the display of the field for `eventinstance` on `/admin/structure/events/instance/types/eventinstance_type/default/edit/display`
3. Rearrange the fields such that the base field is disabled and the inherited
   field is displayed. This is necessary to display the inherited value from
   the series if there is no value on the instance but avoid rendering the
   value twice if the instance has a value.
4. Configure the display for the inherited field on `eventinstance` in the same
   way as the source field on `eventseries`.
5. Implement a template for the field in the theme e.g. `field--field-tags.html.twig`
6. Create a template for the inherited field in the theme. Include the entity
   type in the template name to clarify that this is used for event instances
   e.g. `field--eventinstance--event-tags.html.twig`.
7. If the field should work the same across series and instances then include
   the series template in the instance template:
   `{{ include('field--field-tags.html.twig') }}`
