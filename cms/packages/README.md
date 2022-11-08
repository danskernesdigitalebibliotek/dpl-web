# Self-contained PHP packages

Subdirectories here should contain PHP packages that can be installed through
Composer but have not been published to an external repository. This includes
Drupal modules which have not been published on drupal.org.

There may be multiple reasons for doing so:

* We still consider a package under development
* We do not consider a package appropriate for publication

## Usage

1. Place the package in a subdirectory under `packages`.
2. Ensure that the subdirectory contains a valid `composer.json` file with a
   package name.
3. Add the subdirectory as a [`path` type repository](https://getcomposer.org/doc/05-repositories.md#path)
   in the root project `composer.json`.
4. Require the package using `*` (any) as the version specifier. We always want
   to use the version located at the path.

## Example

We need PHP clients for communicating with external APIs. A package containing
such a client auto-generated from an API specification does not contain much
value outside this project. Consequently, we can place it here.
