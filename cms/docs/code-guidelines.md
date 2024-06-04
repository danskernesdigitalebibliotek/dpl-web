# Code guidelines

The following guidelines describe best practices for developing code for the DPL
CMS project. The guidelines should help achieve:

* A stable, secure and high quality foundation for building and maintaining
  library websites
* Consistency across multiple developers participating in the project
* The best possible conditions for sharing modules between DPL CMS websites
* The best possible conditions for the individual DPL CMS website to customize
  configuration and appearance

Contributions to the core DPL CMS project will be reviewed by members of the
Core team. These guidelines should inform contributors about what to expect in
such a review. If a review comment cannot be traced back to one of these
guidelines it indicates that the guidelines should be updated to ensure
transparency.

## Coding standards

The project follows the [Drupal Coding Standards](https://www.drupal.org/docs/develop/standards)
and best practices for all parts of the project: PHP, JavaScript and CSS. This
makes the project recognizable for developers with experience from other Drupal
projects. All developers are expected to make themselves familiar with these
standards.

The following lists significant areas where the project either intentionally
expands or deviates from the official standards or areas which developers should
be especially aware of.

### General

* The default language for all code and comments is English.

### PHP

* Code must be compatible with all currently available minor and major versions
  of PHP from 8.0 and onwards. This is important when trying to ensure smooth
  updates going forward. Note that this only applies to custom code.
* Code must be compatible with Drupal Best Practices as defined by the
  [Drupal Coder module](https://www.drupal.org/project/coder)
* Code must use [types](https://www.php.net/manual/en/language.types.declarations.php#language.types.declarations.strict)
  to define function arguments, return values and class properties.
* Code must use [strict typing](https://www.php.net/manual/en/language.types.declarations.php#language.types.declarations.strict).

### JavaScript

* All functionality exposed through JavaScript should use the
  [Drupal JavaScript API](https://www.drupal.org/docs/drupal-apis/javascript-api/javascript-api-overview)
  and must be attached to the page using Drupal behaviors.
* All classes used for selectors in Javascript must be prefixed with `js-`.
  Example: `<div class="gallery js-gallery">` - `.gallery` must only be used in
  CSS, `js-gallery` must only be used in JS.
* Javascript should not affect classes that are not state-classes. State classes
  such as `is-active`, `has-child` or similar are classes that can be used as
  an interlink between JS and CSS.

### CSS

* Modules and themes should use SCSS (The project uses [PostCSS](http://sass-lang.com/libsass)
  and [PostCSS-SCSS](https://github.com/postcss/postcss-scss)). The Core system
  will ensure that these are compiled to CSS files automatically as a part of
  the development process.
* Class names should follow the [Block-Element-Modifier architecture](http://getbem.com/introduction/)
  (BEM). This rule does not apply to state classes.
* Components (blocks) should be isolated from each other. We aim for an
  [atomic frontend](https://www.welcometothejungle.com/en/articles/atomic-design-front-end-developer)
  where components should be able to stand alone. In practice, there will be
  times where this is impossible, or where components can technically stand
  alone, but will not make sense from a design perspective (e.g. putting a
  gallery in a sidebar).
* Components should be technically isolated by having 1 component per scss file.
  **As a general rule, you can have a file called `gallery.scss` which contains
  `.gallery, .gallery__container, .gallery__*` and so on. Avoid referencing
  other components when possible.
* All components/mixins/similar must be documented with a code comment. When you
  create a new `component.scss`, there must be a comment at the top, describing
  the purpose of the component.
* Avoid using auto-generated Drupal selectors such as `.pane-content`. Use
  the Drupal theme system to write custom HTML and use precise, descriptive
  class names. It is better to have several class names on the same element,
  rather than reuse the same class name for several components.
* All "magic" numbers must be documented. If you need to make something e.g.
  350 px, you preferably need to find the number using calculating from the
  context (`$layout-width * 0.60`) or give it a descriptive variable name
  (`$side-bar-width // 350px works well with the current $layout-width_`)
* Avoid using the parent selector (`.class &`). The use of [parent selector](https://sass-lang.com/documentation/style-rules/parent-selector)
  results in complex deeply nested code which is very hard to maintain. There
  are times where it makes sense, but for the most part it can and should be
  avoided.

## Naming

### Modules

* All modules written specifically for Ding3 must be prefixed with `dpl`.
* The `dpl` prefix is not required for modules which provide functionality deemed
  relevant outside the DPL community and are intended for publication on
  Drupal.org.

### Files

Files provided by modules must be placed in the following folders and have the
extensions defined here.

* General
  * `MODULENAME.*.yml`
  * `MODULENAME.module`
  * `MODULENAME.install`
  * `templates/*.html.twig`
* Classes, interfaces and traits
  * `src/**/*.php`
* PHPUnit tests
  * `tests/**/*.php`
* CSS
  * If the module does not not use processing: `/css/COMPONENTNAME.css`
  * If the module uses preprocessing: `/scss/COMPONENTNAME.scss`
* JavaScript
  * `js/*.js`
* Images
  * `img/*.(png|jpeg|gif|svg)`

## Module elements

Programmatic elements such as settings, state values and views modules must
comply to a set of common guidelines.

* Machine names should be prefixed with the name of the module that is
  responsible for managing the elements.
* Administrative titles, human readable names and descriptions should be
  relatable to the module name.

As there is no finite set of programmatic elements for a DPL CMS site these
apply to all types unless explicitly specified.

## Code Structure

The project follows the code structure suggested by the
[drupal/recommended-project Composer template](https://www.drupal.org/docs/develop/using-composer/using-composer-to-install-drupal-and-manage-dependencies).

Modules, themes etc. must be placed within the corresponding folder in this
repository. If a module developed in relation to this project is of general
purpose to the Drupal community it should be placed on Drupal.org and included
as an external dependency.

A module must provide all required code and resources for it to work on its own
or through dependencies. This includes all configuration, theming, CSS, images
and JavaScript libraries.

All default configuration required for a module to function should be
implemented using the Drupal configuration system and stored in the version
control with the rest of the project source code.

## Updating modules

If an existing module is expanded with updates to current functionality the
default behavior must be the same as previous versions or as close to this as
possible. This also includes new modules which replaces current modules.

If an update does not provide a way to reuse existing content and/or
configuration then the decision on whether to include the update resides with
the business.

## Altering existing modules

Modules which alter or extend functionality provided by other modules should use
appropriate methods for overriding these e.g. by implementing alter hooks or
overriding dependencies.

## Translations

All interface text in modules must be in English. Localization of such texts
must be handled using the [Drupal translation API](https://www.drupal.org/docs/8/api/translation-api/overview).

All interface texts must be provided with a context. This supports separation
between the same text used in different contexts. Unless explicitly stated
otherwise the module machine name should be used as the context.

## Third party code

The project uses package managers to handle code which is developed outside of
the Core project repository. Such code must not be committed to the Core project
repository.

The project uses two package manages for this:

* [Composer](https://getcomposer.org/) - primarily for managing PHP packages,
  Drupal modules and other code libraries which are executed at runtime in the
  production environment.
* [Yarn](https://yarnpkg.com/) - primarily for managing code needed to establish
  the pipeline for managing frontend assets like linting, preprocessing and
  optimization of JavaScript, CSS and images.

When specifying third party package versions the project follows these
guidelines:

* Use the [^ next significant release operator](https://getcomposer.org/doc/articles/versions.md#next-significant-release-operators)
  for packages which follow semantic versioning.
* The version specified must be the latest known working and secure version. We
  do not want accidental downgrades.
* We want to allow easy updates to all working releases within the same major
  version.
* Packages which are not intended to be executed at runtime in the production
  environment should be marked as development dependencies.

### Altering third party code

The project uses patches rather than forks to modify third party packages. This
makes maintenance of modified packages easier and avoids a collection of forked
repositories within the project.

* Use an appropriate method for the corresponding package manager for managing
  the patch.
* Patches should be external by default. In rare cases it may be needed to
  commit them as a part of the project.
* When providing a patch you must document the origin of the patch e.g. through
  an url in a commit comment or preferably in the package manager configuration
  for the project.

## Error handling and logging

Code may return null or an empty array for empty results but must throw
exceptions for signalling errors.

When throwing an exception the exception must include a meaningful error message
to make debugging easier. When rethrowing an exception then the original
exception must be included to expose the full stack trace.

When handling an exception code must either log the exception and continue
execution or (re)throw the exception - not both. This avoids duplicate log
content.

Drupal modules must use the [Logging API](https://www.drupal.org/docs/8/api/logging-api/overview).
When logging data the module must use its name as the logging channel and
[an appropriate logging level](https://sematext.com/blog/logging-levels/).

Modules integrating with third party services must implement a Drupal setting
for logging requests and responses and provide a way to enable and disable this
at runtime using the administration interface. Sensitive information (such as
passwords, CPR-numbers or the like) must be stripped or obfuscated in the logged
data.

## Code comments

Code comments which describe _what_ an implementation does should only be used
for complex implementations usually consisting of multiple loops, conditional
statements etc.

Inline code comments should focus on _why_ an unusual implementation has been
implemented the way it is. This may include references to such things as
business requirements, odd system behavior or browser inconsistencies.

## Commit messages

Commit messages in the version control system help all developers understand the
current state of the code base, how it has evolved and the context of each
change. This is especially important for a project which is expected to have a
long lifetime.

Commit messages must follow these guidelines:

1. Each line must not be more than 72 characters long
2. The first line of your commit message (the subject) must contain a short
   summary of the change. The subject should be kept around 50 characters long.
3. The subject must be followed by a blank line
4. Subsequent lines (the body) should explain what you have changed and why the
   change is necessary. This provides context for other developers who have not
   been part of the development process. The larger the change the more
   description in the body is expected.
5. If the commit is a result of an issue in a public issue tracker,
   platform.dandigbib.dk, then the subject must start with the issue number
  followed by a colon (:). If the commit is a result of a private issue tracker
  then the issue id must be kept in the commit body.

When creating a pull request the pull request description should not contain any
information that is not already available in the commit messages.

Developers are encouraged to read [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
by Chris Beams.

## Tool support

The project aims to automate compliance checks as much as possible using static
code analysis tools. This should make it easier for developers to check
contributions before submitting them for review and thus make the review process
easier.

The following tools pay a key part here:

1. [PHP_Codesniffer](https://github.com/squizlabs/PHP_CodeSniffer) with the
   following rulesets:
   * [Drupal Coding Standards](https://www.drupal.org/docs/develop/standards/coding-standards)
      as defined the [Drupal Coder module](https://www.drupal.org/project/coder)
   * [RequireStrictTypesSniff](https://github.com/squizlabs/PHP_CodeSniffer/blob/master/src/Standards/Generic/Sniffs/PHP/RequireStrictTypesSniff.php)
      as defined by PHP_Codesniffer
2. [Eslint](https://eslint.org/) and [Airbnb JavaScript coding standards](https://github.com/airbnb/javascript)
   as defined by [Drupal Core](https://www.drupal.org/docs/develop/standards/javascript/eslint-settings)
3. [Prettier](https://prettier.io/) as defined by [Drupal Core](https://www.drupal.org/docs/develop/standards/javascript/eslint-settings)
4. [Stylelint](https://stylelint.io/) with the following rulesets:
   * As defined by [Drupal Core](https://git.drupalcode.org/project/drupal/-/blob/9.2.x/core/.stylelintrc.json)
   * BEM as defined by the [stylelint-bem project](https://www.npmjs.com/package/@namics/stylelint-bem)
   * Browsersupport as defined by the
     [stylelint-no-unsupported-browser-features project](https://www.npmjs.com/package/stylelint-no-unsupported-browser-features)
5. [PHPStan](https://phpstan.org/) with the following configuration:
   * Analysis level 8 to support detection of missing types
   * Drupal support as defined by the [phpstan-drupal project](https://github.com/mglaman/phpstan-drupal)
   * Detection of deprecated code as defined by the [phpstan-deprecation-rules project](https://github.com/phpstan/phpstan-deprecation-rules)

In general all tools must be able to run locally. This allows developers to get
quick feedback on their work.

Tools which provide automated fixes are preferred. This reduces the burden of
keeping code compliant for developers.

Code which is to be exempt from these standards must be marked accordingly in
the codebase - usually through inline comments ([Eslint](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments),
[PHP Codesniffer](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Advanced-Usage#ignoring-parts-of-a-file)).
This must also include a human readable reasoning. This ensures that deviations
do not affect future analysis and the Core project should always pass through
static analysis.

If there are discrepancies between the automated checks and the standards
defined here then developers are encouraged to point this out so the automated
checks or these standards can be updated accordingly.
