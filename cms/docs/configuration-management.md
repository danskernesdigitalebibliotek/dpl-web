# Configuration Management

We use the [Configuration Ignore module](architecture/adr-001-configuration-management.md)
to manage configuration.

In general all configuration is ignored except for configuration which should
explicitly be managed by DPL CMS core.

## Background

Configuration management for DPL CMS is a complex issue. The complexity stems
from the following factors:

### Site types

There are multiple types of DPL CMS sites all using the same code base:

1. *Developer* (In Danish: Programmør) sites where the library is entirely free
   to work with the codebase for DPL CMS as they please for their site
2. *Webmaster* sites where the library can install and
   manage additional modules for their DPL CMS site
3. *Editor* (In Danish: Redaktør) sites where the library can configure their
   site based on predefined configuration options provided by DPL CMS
4. *Core* sites which are default versions of DPL CMS used for development and
   testing purposes

All these site types must support the following properties:

1. It must be possible for system administrators to deploy new versions of
   DPL CMS which may include changes to the site configuration
2. It must be possible for libraries to configure their site based on the
   options provided by their type site. This configuration must not be
   overridden by new versions of DPL CMS.

### Configuration types

This can be split into different types of configuration:

1. *Core configuration*: This is the configuration for the base installation of
   DPL CMS which is shared across all sites. The configuration will be imported
   on deployment to support central development of the system.
2. *Local configuration*: This is the local configuration for the individual
   site. The level of configuration depends on the site type but no matter the
   type this configuration must not be overridden on deployment of new versions
   of DPL CMS.

## Howtos

### Install a new site from scratch

1. Run `drush site-install --existing-config -y`

### Add new core configuration

1. Create the relevant configuration through the administration interface
2. Run `drush config-export -y`
3. Append the key for the configuration to
   `config_ignore.settings.ignored_config_entities` with the `~` prefix
4. Commit the new configuration files and the updated `config_ignore.settings`
   file

### Update existing core configuration

1. Update the relevant configuration through the administration interface
2. Run `drush config-export -y`
3. Commit the updated configuration files

NB: The keys for these configuration files should already be in
`config_ignore.settings.ignored_config_entities`.

### Add new local configuration

1. Update the relevant configuration through the administration interface
2. Run `drush config-export -y`
3. Commit the updated configuration files

### Enable a new module

<!-- markdownlint-disable ol-prefix -->
1. Add the module to the project code base or as a Composer dependency
2. Create an update hook in the DPL CMS installation profile which enables the
   module[^1]. You may want to use `dpl_base.install`.

```php
function dpl_cms_update_9000() {
   \Drupal::service('module_installer')->install(['shortcut']);
}
```

3. Run the update hook locally `drush updatedb -y`
4. Export configuration `drush config-export -y`
5. Commit the resulting changes to the site configuration, codebase and/or
   Composer files

### Uninstall a existing module

1. Create an update hook in the DPL CMS installation profile which uninstalls
   the module[^1]

```php
function dpl_cms_update_9001() {
   \Drupal::service('module_installer')->uninstall(['shortcut']);
}
```

2. Run the update hook locally `drush updatedb -y`
3. Commit the resulting changes to the site configuration
4. Export configuration `drush config-export -y`
5. Plan for a future removal of code for the module
<!-- markdownlint-enable ol-prefix -->

### Deploy configuration changes

1. Run `drush deploy`

NB: It is important that the official Drupal deployment procedure is followed.
Database updates must be executed before configuration is imported. Otherwise
we risk ending up in a situation where the configuration contains references
to modules which are not enabled.

[^1]: Creating update hooks for modules is only necessary once we have sites
running in production which will not be reinstalled. Until then it is OK to
enable/uninstall modules as normal and committing changes to `core.extensions`.
