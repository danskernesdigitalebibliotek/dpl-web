#!/usr/bin/env bash

# We need to remove the package, as composer will avoid installing it
# otherwise as it sees no version change.
composer remove "danskernesdigitalebibliotek/dpl-react"
composer clear-cache
composer require "danskernesdigitalebibliotek/dpl-react:0.0.0-dev"
drush cr
