<?php

// Disable automated cron for production environment.
// In production Lagoon will execute cron in the background as defined in
// .lagoon.yml. This is currently not supported for pull request environments
// so here we rely on Drupals Automated Cron module for cron execution.
$config['automated_cron.settings']['interval'] = 0;
