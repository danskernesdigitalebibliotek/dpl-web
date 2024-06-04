<?php

# Enable verbose error reporting.
$config['system.logging']['error_level'] = 'verbose';

// Disable the "config auto ignore" module on local development.
// When config_ignore_auto is enabled, it means that saving config-forms will
// add the saved changes as 'ignored', and won't be overriden on next deploy.
// This is a problem for development, as we obviously want to be able to
// "cex" and "cim" our updates.
$config['config_ignore_auto.settings']['status'] = FALSE;
