# Architecture Decision Record: Translation: Moving from Potion to POTX

## Context

[ADR-009](./adr-009-translation-system.md) chose
[Potion](https://www.drupal.org/project/potion) to scan the codebase for
translatable strings. Potion is unmaintained. We pinned it to a `dev-2.x` git
commit and carried seven patches to keep it working, two of them purely for
Drupal 10 compatibility. It is not Drupal 11 ready: its annotation extractor is
built on the doctrine annotation machinery that Drupal 11 removes.

ADR-009 rejected [POTX](https://www.drupal.org/project/potx) because it
"extract[s] strings to a `.pot` file without having the possibility of filling
in the existing translations". This was a misunderstanding of what the module
offered - potx fills in the translations held in the database as it scans,
through the Drush command we now use.

## Decision

We use POTX instead of Potion for scanning.

`drush potx single --language=da --translations` replaces both
`potion:generate` and `potion:fill`: it scans and fills in existing
translations from the database in one pass. Potx writes hardcoded
`general.pot` and `installer.pot` files into the Drupal root, so
[`scan-translations.sh`](../../../cms/dev-scripts/translate-source/scan-translations.sh)
moves each scan's output aside and combines the results with `msgcat`.

The POEditor integration is unchanged - same file, same path, same webhook.

### Patches

Potx and Potion do not find exactly the same strings. We deliberately and
selectively patch potx in the two cases where it misses something Potion found
and where the string in question already had a Danish translation. Both patches
live in [`cms/patches/`](../../../cms/patches/):

- **`potx-scan-translationinterface-translate.patch`** - potx does not scan
  `translate()`, so strings passed to an injected `TranslationInterface` are
  invisible to it. Not filed upstream: `ContentEntityInterface::translate()`
  takes a langcode, and potx matches on a flat token stream, so a general
  version of this would extract `'da'` as a translatable string on any site
  that translates entities.
- **`potx-translation-annotation-arguments.patch`** - potx skips a
  `@Translation` annotation that carries an `arguments` parameter. Filed
  upstream as
  [#3615813](https://www.drupal.org/project/potx/issues/3615813); both
  `arguments` and `context` are documented parameters of the annotation, so
  this is a plain bug.

Neither patch is a goal in itself. Dropping them costs the strings they cover,
which is a trade we may want to make later in favour of running potx unpatched.

### Why the 2.x alpha and not the 1.x stable release

`8.x-1.1` declares Drupal 11 compatibility, but the branch does not deliver it.
The 2.x branch contains every commit in `8.x-1.1` plus the fixes we depend on:

- [#3308598](https://www.drupal.org/project/potx/issues/3308598): Drush 10+
  support in 1.x was inadequate. We drive potx entirely from Drush.
- [#3528177](https://www.drupal.org/project/potx/issues/3528177): Twig scanning
  stopped recognising `t` filters as of Twig 3.21, which is the Twig Drupal 11
  ships.
- [#3570518](https://www.drupal.org/project/potx/issues/3570518): core language
  list parsing is not Drupal 11 compatible.
- [#3354887](https://www.drupal.org/project/potx/issues/3354887): the 1.x info
  file claimed core compatibility it did not have.

2.x additionally carries the Drupal 12 compatibility work.

## Consequences

- Seven patches and a git-commit pin become two patches on a tagged release
  supporting Drupal 10, 11 and 12.
- Potx covers more than Potion did: `.theme` files, JavaScript,
  `*.permissions.yml` and config schema labels. Roughly a thousand strings
  became translatable that never were, including the Novel theme settings form.
- Potx skips `tests/`, `vendor/` and `*.api.php`. About 140 strings left the
  translation file - PHPUnit assertion messages and test fixtures that should
  never have reached translators.
- Potx also extracts logger calls, so log messages now appear in POEditor. We
  accepted that rather than patching it out.
- Potion silently trimmed whitespace from every string. A few msgids therefore
  change shape - and `' DKK'` becomes translatable at all, which it was not
  before.
- Measured in a CI-equivalent environment, against the previous file: 6,742 of
  6,926 terms unchanged, 1,045 added, 184 dropped. No surviving term lost its
  translation. Of the dropped terms, 170 carried a Danish translation, but 133
  of those exist only in `tests/` directories or `*.api.php` files - the
  translators had been translating test fixtures. The rest are whitespace and
  context churn plus a handful of contrib strings not reachable from real code.
- Comparing generated files requires a CI-equivalent site. Config strings are
  exported with the translations held in the local site's `language.da`
  config collection, and `ci:reset` skips importing those, so a scan run on a
  normal dev site fills in around 1,700 config translations that CI leaves
  empty. See [ADR-011](./adr-011-configuration-translation-system.md).

## Alternatives considered

1. Keeping Potion and maintaining it ourselves. It offers nothing that potx
   does not, so this would be work spent on staying where we are.
2. Patching potx to keep scanning `tests/`, so the generated file stays
   identical to the Potion one. Rejected - it would mean translating PHPUnit
   assertion messages forever.
3. [ITK's translation extractor](https://github.com/itk-dev/drupal_translation_extractor),
   which extracts from PHP, Twig and JavaScript using Symfony's translation
   component. We found no advantage over potx, and it is published on GitHub by
   a single vendor where potx is a drupal.org project with an established
   maintainer team.
