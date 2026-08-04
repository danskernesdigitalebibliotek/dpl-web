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

We carry two patches in [`cms/patches/`](../../../cms/patches/). Both exist
because potx fails to extract strings we need, and in both cases the failure is
silent in the resulting file.

#### `potx-scan-translationinterface-translate.patch`

**Why:** potx does not scan `translate()`, so strings passed to an injected
`TranslationInterface` - `$this->translation->translate('...')` - are invisible
to it. We use that call form in 31 places across 8 files. Four of those files
are enums, which cannot use `StringTranslationTrait` at all, since the trait
declares a property and enums cannot have properties.

**If removed:** around 30 strings disappear from the translation file and lose
their Danish. The alternative to keeping the patch is to rewrite those 31 call
sites as `new TranslatableMarkup($string, $args, $options, $this->translation)`,
which builds the identical object and is scanned without any patch - core's
`translate()` is literally that constructor call.

**Deliberately not filed upstream.** `ContentEntityInterface::translate()` takes
a langcode, and potx matches on a flat token stream, so a general version of
this would make potx extract `'da'` as a translatable string on any site that
translates entities. It is only safe here because we never call `translate()` on
an entity. Grep before assuming that still holds.

#### `potx-translation-annotation-arguments.patch`

**Why:** potx's `@Translation` pattern allowed only an optional `context`
parameter before the closing parenthesis, so an annotation carrying any other
parameter failed to match and its string was skipped. The common case is
`arguments`, used for placeholders:

```php
description = @Translation("A string provided by <a href=':google'>Google</a>.",
  arguments = { ":google" = "https://www.google.com/" }),
```

**If removed:** 13 strings disappear, all metatag field descriptions, and all 13
had Danish translations. Potx additionally reports each one as an error ("In
@Translation, only one, non-empty static string is allowed in double quotes"),
even though the annotation is perfectly valid.

**Worth filing upstream.** Both `arguments` and `context` are documented
parameters of the Translation annotation, so this is a plain bug rather than
anything specific to our codebase.

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

1. Keep Potion and port it to Drupal 11 ourselves. Drupal 11 converts plugin
   annotations to attributes, so the extractor's input format is disappearing
   regardless of whether the module is made to run.
2. Patch potx to keep scanning `tests/`, so the file stays identical.
   Rejected - it would mean translating PHPUnit assertion messages forever.
3. [ITK's translation extractor](https://github.com/itk-dev/drupal_translation_extractor),
   which extracts from PHP, Twig and JavaScript using Symfony's translation
   component. It is published only on GitHub by a single vendor, where potx is
   a drupal.org contrib project with an established maintainer team. For
   something the translation pipeline of every site depends on, we prefer the
   latter.
