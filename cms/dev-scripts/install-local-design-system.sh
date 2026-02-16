#!/usr/bin/env bash

# We need to remove the package, as composer will avoid installing it
# otherwise as it sees no version change.
composer remove "danskernesdigitalebibliotek/dpl-design-system"
composer clear-cache
composer require "danskernesdigitalebibliotek/dpl-design-system:0.0.0-dev"
drush cr
