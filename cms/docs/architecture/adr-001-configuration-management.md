# Architecture Decision Record: Configuration Management

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

We use the
[Configuration Ignore module](https://www.drupal.org/project/config_ignore)
and the [Config Ignore Auto module](https://www.drupal.org/project/config_ignore_auto)
to manage configuration.

The base module maintains a list of patterns for configuration which will be
ignored  during the configuration import process. This allows us to avoid
updating local configuration.

Here, we can add some of the settings files that we already know needs to be
ignored and admin-respected.
But in reality, we don't need to do this manually, because of the second module:

**Config Ignore Auto** is only enabled on non-development sites.
It works by treating any settings that are updated (site settings, module
settings etc.) as to be ignored.
These settings will NOT be overriden on next deploy by `drush config-import`.

The consequences of using this setup is

1) We need to ignore `core.extension.yml`, for administrators to manage modules
   - This means that we need to enable/disable new modules using code.
     See `dpl_update.install` for how to do this, through Drupal update hooks.
2) If a faulty permission has been added, or if a decision has been made to
   remove an existing permission, there might be config that we dont want to
   ignore, that is ignored on some libraries.

   - This means we'll first have to detect which libraries have overriden config

     ```bash
       drush config:get config_ignore_auto.settings ignored_config_entities
         --format json
     ```

      and then either decide to override it, or migrate the existing.

3) A last, and final consequence, is that we need to treat permissions more
   strictly that we do now.
   - An exampls is `adminster site settings` also both allows stuff we want to
     ignore (site name), but also things we don't want to ignore (404 node ID).

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
