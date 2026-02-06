# Configuration import

Setting up a new site for testing certain scenarios can be repetitive. To avoid
this the project provides a module: DPL Config Import.  This module can be used
to import configuration changes into the site and install/uninstall modules in a
single step.

The configuration changes are described in a YAML file with configuration entry
keys and values as well as module ids to install or uninstall.

## How to use

1. Download the [example file](../web/modules/custom/dpl_config_import/dpl_config_import.example.yaml)
   that comes with the module.
2. Edit it to set the different configuration values.
3. Upload the file at `/admin/config/configuration/import`
4. Clear the cache.

## How it is parsed

The yaml file has two root elements `configuration` and `modules`.

A basic file looks like this:

```yaml
configuration:
  # Add keys for configuration entries to set.
  # Values will be merged with existing values.
  system.site:
    # Configuration values can be set directly
    slogan: 'Imported by DPL config import'
    # Nested configuration is also supported
    page:
      # All values in nested configuration must have a key. This is required to
      # support numeric configuration keys.
      403: '/user/login'

modules:
  # Add module ids to install or uninstall
  install:
    - menu_ui
  uninstall:
    - redis
```
