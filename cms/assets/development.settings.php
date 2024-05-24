<?php

# Enable verbose error reporting.
$config['system.logging']['error_level'] = 'verbose';

// Disable the "config auto ignore" module on local development.
$config['config_ignore_auto.settings']['status'] = FALSE;
