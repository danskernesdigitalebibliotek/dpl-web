# Architecture Decision Record: Translation system

## Context

The current translation system for UI strings in DPL CMS is based solely on code
deployment of `.po` files.

However DPL CMS is expected to be deployed in about 100 instances just to cover
the Danish Public Library institutions. Making small changes to the UI texts in
the codebase would require a new deployment for each of the instances.

Requiring code changes to update translations also makes it difficult for
non-technical participants to manage the process themselves. They have to find a
suitable tool to edit `.po` files and then pass the updated files to a
developer.

This process could be optimized if:

1. Translations were provided by a central source
2. Translations could be managed directly by non-technical users
3. Distribution of translations is decoupled from deployment

## Decision

We keep using GitHub as a central source for translation files.

We configure Drupal to consume translations from GitHub. The Drupal translation
system already supports runtime updates and [consuming translations from a
remote source](https://api.drupal.org/api/drupal/core!modules!locale!locale.api.php/group/interface_translation_properties/).

We use [POEditor](https://poeditor.com) to perform translations. POEditor is a
translation management tool that supports `.po` files and integrates with
GitHub. To detect new UI strings a GitHub Actions workflow scans the codebase
for new strings and notifies POEditor. Here they can be translated by
non-technical users. POEditor supports committing translations back to GitHub
where they can be consumed by DPL CMS instances.

## Consequences

This approach has a number of benefits apart from addressing the original
issue:

- POEditor is a specialized tool to manage translations. It supports features
  such as translation memory, glossaries and machine translation.
- POEditor is web-based. Translators avoid having to find and install a suitable
  tool to edit `.po` files.
- POEditor is software-as-a-service. We do not need to maintain the translation
  interface ourselves.
- POEditor is free for open source projects. This means that we can use it
  without having to pay for a license.
- Code scanning means that new UI strings are automatically detected and
  available for translation. We do not have to manually synchronize translation
  files or ensure that UI strings are rendered by the system before they can be
  translated. This can be complex when working with special cases, error
  messages etc.
- Translations are stored in version control. Managing state is complex and this
  means that we have easy visibility into changes.
- Translations are stored on GitHub. We can move away from POEditor at any time
  and still have access to all translations.
- We reuse existing systems instead of building our own.

A consequence of this approach is that developers have to write code that
supports scanning. This is partly supported by the Drupal Code Standards. To
support contexts developers also have to include these as a part of the `t()`
function call e.g.

```php
// Good
$this->t('A string to be translated', [], ['context' => 'The context']);
$this->t('Another string', [], ['context' => 'The context']);
// Bad
$c = ['context' => 'The context']
$this->t('A string to be translated', [], $c);
$this->t('Another string', [], $c);
```

We could consider writing a custom sniff or PHPStan rule to enforce this

### Potion

For covering the functionality of scanning the code we had two potential
projects that could solve the case:

- [Potion](https://www.drupal.org/project/potion)
- [Potx](https://www.drupal.org/project/potx)

Both projects can scan the codebase and generate a `.po` or `.pot` file with the
translation strings and context.

At first it made most sense to go for Potx since it is used by
[localize.drupal.org](https://localize.drupal.org) and it has a long history.
But Potx is extracting strings to a `.pot` file without having the possibility
of filling in the existing translations. So we ended up using Potion which can
fill in the existing strings.

A flip side using Potion is that it is not being maintained anymore. But it
seems quite stable and a lot of work has been put into it. We could consider to
back it ourselves.

## Alternatives considered

We considered the following alternatives:

1. Establishing our own localization server. This proved to be very complex.
   Available solutions are either [technically outdated](https://www.drupal.org/project/l10n_server)
   or [still under heavy development](https://gitlab.com/drupal-infrastructure/sites/localize.drupal.org).
   None of them have integration with GitHub where our project is located.
2. Using a separate instance of DPL CMS in Lagoon as a central translation hub.
   Such an instance would require maintenance and we would have to implement a
   method for exposing translations to other instances.
