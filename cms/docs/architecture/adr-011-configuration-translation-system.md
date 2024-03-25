# Architecture Decision Record: Configuration translation system

## Context

The translation system described in [adr-009-translation-system](./adr-009-translation-system.md) handles solely the translations added through Drupals traditional translation handling.

But there was a wish for being able to translate configuration related strings as well: Titles, labels, descriptions etc. in the admin area.

We needed to find a way to handle translation of that kind as well.

## Decision

We went for a solution where we activated the Configuration Translation Drupal core module and added the [Configuration Translation PO contrib module](https://www.drupal.org/project/config_translation_po).

And we added a range of custom drush commands to handle the various configuration translation tasks.

## Consequences

By sticking to the handling of PO files in configuration handling that we are already using in our general translation handling, we can keep the current Github workflows with some alterations.

### Alterations to former translation workflow

With the config translation PO files added we tried to uncover if POEditor was able to handle two PO files simultaneously in both import and export context.
It could not.

But we still needed, in Drupal, to be able to import two different files: One for general translations and one for configuration translations.

We came up with the idea that we could merge the two files going when importing into POEditor and split it again when exporting from POEditor.

We tried it out and it worked so that was the solution we ended up with.

## Alternatives considered

### A hack
We could Keep the machine names of the config in english but writing the titles, labels, descriptions in danish.

But that would have the following bad consequences:
1. The administrators would have to find all the texts in various, not obvious, places in the admin area.
2. It would differ from the general translation routine which is confusing
3. We would not be able to handle multiple languages for the configuration translations

### Extending the Potion module
Change the Potion module to be able to scan configuration translations as well.

We did not have a clear view of the concept of localizing configuration translations in the same manner as the Potion module scans the codebase. It could either be cumbersome to get the two worlds to meet in the same Potion functionalities or simply incompatible.

