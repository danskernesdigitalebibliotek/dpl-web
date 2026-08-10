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
offered - potx fills in the translations held in the database as it scans.

## Decision

We use POTX instead of Potion for scanning.

Scanning is done by our own `dpl_po:scan-source` Drush command, which drives
the potx API directly. It replaces both `potion:generate` and `potion:fill`:
the codebase is scanned and the translations we already have are filled in, in
a single pass.

Potx ships a `drush potx` command of its own, but it scans one directory per
invocation and writes the result to a hardcoded file name in the current
directory. We scan a number of directories into one file, which is why we call
the API rather than the command.

### What gets scanned

Our own code is covered by directory - `modules/custom`, `themes/custom` and
the profile. Some of our modules only run on some sites, `bnf_client` and
`bnf_server` on the BNF site and `dpl_webmaster` on webmaster sites, and their
strings need translating whether or not the site running the scan has them
turned on.

Contrib is covered by the list in
[`scanned_modules.txt`](../../../cms/dev-scripts/translate-source/scanned_modules.txt),
which the command reads. Core is left out either way; its translations come
from localize.drupal.org.

That list is worth understanding before changing it. It is not a considered
selection of the contrib projects worth translating: it was added in 33cc8d770
because Potion crashed on some modules, and naming what to include was the safe
way to stop a newly added module breaking the workflow without it being obvious
why. Potx does not crash, so the reason is gone - but the list has quietly been
deciding what reaches POEditor ever since. Dropping it takes the file from
around 6,000 terms to around 13,400, most of them contrib strings that
localize.drupal.org already translates. That is a decision about what we ask
translators to work on, so it is left for its own day.

The POEditor integration is unchanged - same file, same path, same webhook.

### Patches

We deliberately and selectively patch potx, so that strings Potion used to find
keep being found. Both patches live in [`cms/patches/`](../../../cms/patches/),
and in both cases potx skips the string silently rather than failing.

`potx-scan-translationinterface-translate.patch` - potx does not scan
`translate()`, so strings passed to an injected `TranslationInterface` are
invisible to it, and we use that call form in our own code, including in enums,
which cannot use `StringTranslationTrait` at all. Deliberately not filed
upstream: `ContentEntityInterface::translate()` takes a langcode, and potx
matches on a flat token stream, so a general version would extract `'da'` as a
translatable string on any site that translates entities.

`potx-translation-annotation-arguments.patch` - potx's `@Translation` pattern
accepts only an optional `context` parameter, so an annotation that also passes
`arguments` fails to match and its string is skipped. That costs 13 metatag
field descriptions, all of which have Danish translations. Both parameters are
documented, so this one is a plain upstream bug, filed as
[#3615813](https://www.drupal.org/project/potx/issues/3615813).

Two further potx shortcomings are handled in the Drush command rather than by
patching, because both are about the shape of the output file rather than about
which strings get found:

- The `@Translation` extractor saves its match raw, where every other extractor
  in `potx.inc` escapes it first. An annotation wrapped over two lines
  therefore carries a real newline and the doc comment's continuation into the
  msgid, which makes the file unreadable to gettext - losing every term in it,
  not just the one string. The command escapes what potx left raw and folds the
  continuation back into a space.
- Potx keys a plural string by both of its forms and a plain string by itself,
  so the same text reached through `formatPlural()` and through `t()` is one
  message defined twice as far as gettext is concerned. The command keeps the
  plural, whose first form is the singular translation.

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
  translators had been translating test fixtures.

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
