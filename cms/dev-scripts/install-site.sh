#!/usr/bin/env bash

set -aeo pipefail

# Install site.
drush site-install --existing-config -y

# Practice shows that the cache needs to be cleared to avoid configuration
# errors even after a site install.
drush cache:rebuild -y

# Import translations.
if [ -n "${SKIP_LANGUAGE_IMPORT}" ]; then
  echo "Skipping language import due to SKIP_LANGUAGE_IMPORT environment variable"
else
  drush locale-check
  drush locale-update
  drush dpl_po:import-remote-config-po da https://danskernesdigitalebibliotek.github.io/dpl-cms/translations/da.config.po
fi

# Clear all caches to ensure we have a pristine setup.
drush cache:rebuild -y
drush cache:rebuild-external -y

# Run deploy hooks.
drush deploy -y

# Ensure site is reachable and warm any caches
curl --silent --show-error --fail --output /dev/null http://varnish:8080/

# Enable dev modules (see task dev:enable-dev-tools).
drush install -y devel dpl_example_content field_ui purge_ui restui uuid_url views_ui dblog

# Create test users (see task dev:create-users).
drush user:create editor --password="test"
drush user:role:add 'editor' editor

drush user:create administrator --password="test"
drush user:role:add 'administrator' administrator

drush user:create mediator --password="test"
drush user:role:add 'mediator' mediator

drush user:create local_administrator --password="test"
drush user:role:add 'local_administrator' local_administrator

drush user:create external_system --password="external_system"
drush user:role:add 'external_system' external_system

drush user:create patron --password="test"
drush user:role:add 'patron' patron

# Show a one-time login to the local site.
drush user-login
