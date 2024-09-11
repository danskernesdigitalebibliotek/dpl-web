# Webmaster modules

Administrators on webmaster libraries has the ability to upload and
enable extra modules. These can be both standard Drupal contrib
modules, or modules developed by/for the library.

Developing bespoke modules doesn't not differ from developing modules
in general, as installing and configuring modules works as expected.

However, it not uncommon for the developer to wish to provide some
configuration "outside" the modules own configuration, adding taxonomy
vocabularies, adding fields to nodes or even changing basic
configuration variables, which is somewhat challenging as DPL controls
the configuration.

So to avoid every module doing it differently, this guide exists. And
if enough modules finds the need, the technique described here could
be implemented in a `dpl_webmaster` module that provide it as a
service.

## Webmaster module configuration handling

First off, a warning: when using this technique you take the
responsibility of the configuration added/overridden in this way. If
you for instance override the node form display configuration for a
node type, it's your responsibility to keep it up to date with changes
in DPL core.

Adding new configuration for modules not in DPL is more safe, but you
should look out for dependencies. If a configuration depends on a
particular node type or field being available for instance.

## Overview

Configuration handling in webmaster modules consists of three parts:

1. The configuration itself, in Drupals configuration export YAML
   format, in a `config/sync` directory in the module.
2. An event subscriber that overlays the modules configuration when
   Drupal imports the configuration.
3. A `hook_install` and possibly `hook_update_N` functions that
   trigger configuration import when the module is installed and
   updated.

We'll describe the parts in detail in the following walk-through.

## Walk-through

### Initial configuration

1. Start with a fresh DPL site with the code base from git, that has
   up to date configuration (`task dev:cli -- drush cim` should do
   nothing).
2. Make the required configuration changes in the Drupal
   administration interface.
3. Run `task dev:cli -- drush cex -y` to export the configuration.
4. Now `git status` (or your preferred Git tool) tells you which files
   has been changed, these are the files you need.
5. Copy the changed configuration files to `config/sync` in your
   module and revert the changes to the files in the root
   `config/sync` folder.

### Event subscriber

In order to get DPL to actually use the configuration you just saved,
we'll need to make it visible to Drupal. This can be done by
implementing an event subscriber that overlays the configuration on
`ConfigEvents::STORAGE_TRANSFORM_IMPORT`. An implementation can be
found in
[kdb_brugbyen](https://github.com/kdb/kdb_brugbyen/blob/main/src/EventSubscriber/OverlayConfigEventSubscriber.php).
You can simply copy that and fix the two references to the module (the
namespace and the configuration path).

### Install/update hook

The above will add in the module configuration when the configuration
is imported, but installing or updating a module does not trigger a
configuration import, so you'll need to do it yourself.

Outside of DPL, triggering a configuration import from install/update
hooks is not recommended, but inside DPL we're in a controlled
environment where library sites should always be in sync with the
provided configuration. So triggering an import to overlay module
configuration can be considered safe.

Importing configuration is both simple and horribly convoluted. The
`ConfigImporter` class does all the heavy lifting, but it's not a
service and requires digging out thirteen different services in order
to be instantiated. Again, you can just copy the code from
[kdb_brugbyen](https://github.com/kdb/kdb_brugbyen/blob/main/kdb_brugbyen.install).

## Maintenance

Keeping the module configuration up to date might pose some
challenges.

Just changing the configuration is often simple, just do the
modifications, export and copy the changed files.

Merging in changes from DPL could be problematic, as applying the
configuration changes from the module that's based on the previous
version of DPL might throw a `ConfigImporterException` and leave you
without any of the module changes. In this case you can either rebuild
the configuration in the administration interface and export it fresh,
or by careful inspection of diffs apply the needed changes by hand to
the YAML files. Deployment of such a change is left as an exercise for
the reader...
