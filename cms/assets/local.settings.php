<?php

# Enable verbose error reporting.
$config['system.logging']['error_level'] = 'verbose';

# Disable preprocessing
$config['system.performance']['css']['preprocess'] = FALSE;
$config['system.performance']['js']['preprocess'] = FALSE;

# Disable caching.
$settings['cache']['default'] = 'cache.backend.null';
