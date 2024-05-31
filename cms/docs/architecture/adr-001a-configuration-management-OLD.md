# Architecture Decision Record: Configuration Management

<details>
<summary>
  <strong>Notice - this is outdated, and left here only for historical purposes.</strong><br>
  <strong>✚ Click here to see more!</strong>
  <br>See the new ADR in adr-001b-configuration-management.md
</summary>

## Context

Configuration management for DPL CMS is a complex issue. The complexity stems
from [different types of DPL CMS sites](../configuration-management.md).

There are two approaches to the problem:

1. All configuration is local unless explicitly marked as core configuration
2. All configuration is core unless explicitly marked as local configuration

A solution to configuration management must live up to the following test:

1. Initialize a local environment to represent a site
2. Import the provided configuration through site installation using
   `drush site-install --existing-config -y`
3. Log in to see that Core configuration is imported. This can be verified if
   the site name is set to DPL CMS.
4. Change a Core configuration value e.g. on <http://dpl-cms.docker/admin/config/development/performance>
5. Run `drush config-import -y` and see that the change is rolled back and the
   configuration value is back to default. This shows that Core configuration
   will remain managed by the configuration system.
6. Change a local configuration value like the site name on <http://dpl-cms.docker/admin/config/system/site-information>
7. Run `drush config-import -y` to see that no configuration is imported. This
   shows that local configuration which can be managed by Editor libraries will
   be left unchanged.
8. Enable and configure the Shortcut module and add a new Shortcut set.
9. Run `drush config-import -y` to see that the module is not disabled and the
   configuration remains unchanged. This shows that local configuration in the
   form of new modules added by Webmaster libraries will be left unchanged.

## Decision

We use the [Configuration Ignore module](https://www.drupal.org/project/config_ignore)
to manage configuration.

The module maintains a list of patterns for configuration which will be ignored
during the configuration import process. This allows us to avoid updating local
configuration.

By adding the wildcard `*` at the top of this list we choose an approach where
all configuration is considered local by default.

Core configuration which should not be ignored can then be added to subsequent
lines with the `~` which prefix. On a site these configuration entries will be
updated to match what is in the core configuration.

Config Ignore also has the option of ignoring specific values within settings.
This is relevant for settings such as `system.site` where we consider the site
name local configuration but 404 page paths core configuration.

## Alternatives considered

### Deconfig + Partial Imports

[The Deconfig module](https://www.drupal.org/project/deconfig) allows developers
to mark configuration entries as exempt from import/export. This would allow us
to exempt configuration which can be managed by the library.

This does not handle configuration coming from new modules uploaded on webmaster
sites. Since we cannot know which configuration entities such modules will
provide and Deconfig has no concept of wildcards we cannot exempt the
configuration from these modules. Their configuration will be removed again at
deployment.

We could use partial imports through `drush config-import --partial` to not
remove configuration which is not present in the configuration filesystem.

We prefer Config Ignore as it provides a single solution to handle the entire
problem space.

### Config Ignore Auto

[The Config Ignore Auto module](https://www.drupal.org/project/config_ignore_auto)
extends the Config Ignore module. Config Ignore Auto registers configuration
changes and adds them to an ignore list. This way they are not overridden on
future deployments.

The module is based on the assumption that if an user has access to a
configuration form they should also be allowed to modify that configuration for
their site.

This turns the approach from Config Ignore on its head. All configuration is now
considered core until it is changed on the individual site.

We prefer Config Ignore as it only has local configuration which may vary
between sites. With Config Ignore Auto we would have local configuration *and*
the configuration of Config Ignore Auto.

Config Ignore Auto also have special handling of the `core.extensions`
configuration which manages the set of installed modules. Since webmaster sites
can have additional modules installed we would need workarounds to handle these.

### Config Split

[The Config Split module](https://www.drupal.org/project/config_split) allows
developers to split configurations into multiple groups called settings.

This would allow us to map the different types of configuration to different
settings.

We have not been able to configure this module in a meaningful way which also
passed the provided test.

## Consequences

- Core developers will have to explicitly select new configuration to not ignore
  during the development process. One can not simply run `drush config-export`
  and have the appropriate configuration not ignored.
- Because `core.extension` is ignored Core developers will have to explicitly
  enable and uninstall modules through code as a part of the development
  process.

</details>
