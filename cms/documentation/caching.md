# Caching

DPL-CMS relies on two levels of caching. Standard Drupal Core caching, and
Varnish as an accelerating HTTP cache.

## Drupal

The Drupal Core cache uses Redis as its storage backend. This takes the load off
of the database-server that is typically shared with other sites.

Further more, as we rely on Varnish for all caching of anonymous traffic, the
core Internal Page Cache module has been disabled.

## Varnish

Varnish uses the standard Drupal VCL [from lagoon](https://github.com/uselagoon/lagoon-images/blob/main/images/varnish-drupal/drupal.vcl).

The site is configured with the Varnish Purge module and configured with a
cache-tags based purger that ensures that changes made to the site, is purged
from Varnish instantly.

The configuration follows the Lagoon best practices - reference the
[Lagoon documentation on Varnish](https://docs.lagoon.sh/lagoon/drupal/services/varnish)
for further details.
