# Webmaster modules

Administrators on webmaster libraries has the ability to upload and
enable extra modules. These can be both standard Drupal contrib
modules, or modules developed by/for the library.

Developing bespoke modules doesn't not differ from developing modules
in general, as installing and configuring modules works as expected.

However, it not uncommon for the developer to wish to provide some
configuration "outside" the modules own configuration, adding taxonomy
vocabularies, adding fields to nodes or even changing basic
configuration variables, which is somewhat challenging as DPL CMS
controls the configuration.

So to avoid every module doing it differently, this guide exists. And
if enough modules finds the need, the technique described here could
be implemented in a `dpl_webmaster` module that provide it as a
service.

## Webmaster module configuration handling

First off, a warning: when using this technique you take the
responsibility of the configuration added/overridden in this way. If
you for instance override the node form display configuration for a
node type, it's your responsibility to keep it up to date with changes
in DPL CMS core.

Adding new configuration for modules not in DPL CMS is more safe, but
you should look out for dependencies. If a configuration depends on a
particular node type or field being available for instance.

In general, you should get more familiar with the configuration YAML
you're putting into your module, than you're used to from general
Drupal configuration management, and know exactly why you need each
one.

### Overview

Configuration handling in webmaster modules consists of three parts:

1. The configuration itself, in Drupals configuration export YAML
   format, in a `config/sync` directory in the module.
2. An event subscriber that overlays the modules configuration when
   Drupal imports the configuration.
3. A `hook_install` and possibly `hook_update_N` functions that
   trigger configuration import when the module is installed and
   updated.

We'll describe the parts in detail in the following walk-through.

### Walk-through

#### Initial configuration

1. Start with a fresh DPL CMS site with the code base from git, that
   has up to date configuration (`task dev:cli -- drush cim` should do
   nothing).
2. Make the required configuration changes in the Drupal
   administration interface.
3. Run `task dev:cli -- drush cex -y` to export the configuration.
4. Now `git status` (or your preferred Git tool) tells you which files
   has been changed, these are the files you need.
5. Copy the changed configuration files to `config/sync` in your
   module and revert the changes to the files in the root
   `config/sync` folder.

#### Event subscriber

In order to get DPL CMS to actually use the configuration you just
saved, we'll need to make it visible to Drupal. This can be done by
implementing an event subscriber that overlays the configuration on
`ConfigEvents::STORAGE_TRANSFORM_IMPORT`.

An implementation can be found in
[kdb_brugbyen](https://github.com/kdb/kdb_brugbyen/blob/main/src/EventSubscriber/OverlayConfigEventSubscriber.php).
You can simply copy that and fix the two references to the module (the
namespace and the configuration path).

#### Install/update hook

The above will add in the module configuration when the configuration
is imported, but installing or updating a module does not trigger a
configuration import, so you'll need to do it yourself.

Outside of DPL CMS, triggering a configuration import from
install/update hooks is not recommended, but inside DPL CMS we're in a
controlled environment where library sites should always be in sync
with the provided configuration. So triggering an import to overlay
module configuration can be considered safe.

Importing configuration is both simple and horribly convoluted. The
`ConfigImporter` class does all the heavy lifting, but it's not a
service and requires digging out thirteen different services in order
to be instantiated. Again, you can just copy the code from
[kdb_brugbyen](https://github.com/kdb/kdb_brugbyen/blob/main/kdb_brugbyen.install).

### Maintenance

Keeping the module configuration up to date might pose some
challenges.

#### Module configuration changes

Changing the configuration is often simple, just do the modifications,
export and copy the changed files. You'll need to add an update hook
that triggers a configuration import in order for the changes to take
effect when the module is updated.

#### DPL CMS configuration changes

Merging in changes from DPL CMS could be problematic, as applying the
configuration changes from the module that's based on the previous
version of DPL CMS might throw a `ConfigImporterException` and make
the deployment fail.

The hard failure modes of this sounds bad, but the deployment policy
of first rolling out new DPL CMS releases to the libraries
`moduletest` environments should catch these issues before they hit
production.

When this happens, you can either rebuild the configuration in the
administration interface and export it fresh, or by careful inspection
of diffs apply the needed changes by hand to the YAML files.

Even if importing the configuration doesn't show any errors, the fact
that the module in effect replaces part of the DPL CMS configuration
might cause upstream changes to get lost, so you should occasionally
check for this. This can be done by doing a configuration export and
inspecting the diff of the configuration changes for changes that's
unrelated to the modules changes.

Deploying the fixed version requires some extra care. Obviously, you
cannot update the module after updating DPL CMS, as the upgrade will
fail when trying to apply the old changes from the module to the new
DPL CMS configuration. So you'll have to update the module first, but
you should not trigger an configuration import when doing so, as that
would likely fail just as bad when trying to overlay the modules new
configuration on the old DPL CMS configuration (so no `hook_update_N`
for this version of the module).

Test it out first on `moduletest`.

1. Ask the hosting team to get `moduletest` reverted to the previous
DPL CMS version and database and files synced with production.
2. Update the module.
3. Ask the hosting team to upgrade the `moduletest` environment.

If it works, you can update the module in production and ask for
upgrading production. Make the library aware that, in the timespan
between updating the module and updating DPL CMS, they cannot do
anything that triggers a configuration import. In practice this should
translate to "don't upload any webmaster modules", as that should be
about the only thing apart from a DPL CMS update that triggers an
import.
