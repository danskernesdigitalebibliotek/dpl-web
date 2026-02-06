# Architecture Decision Record: Caching of DPL React and other js resources

## Context

The general caching strategy is defined in another document and this focused on
describing the caching strategy of DPL react and other js resources.

We need to have a caching strategy that makes sure that:

* The js files defined as Drupal libraries (which DPL react is) and pages that
  make use of them are being cached.
* The same cache is being flushed upon deploy because that is the moment where
  new versions of DPL React can be introduced.

## Decision

We have created a purger in the Drupal Varnish/Purge setup that is able to purge
everything. The purger is being used in the deploy routine by the command:
`drush cache:rebuild-external -y`

## Consequences

* Everything will be invalidated on every deploy. Note: Although we are sending
  a `PURGE` request we found out, by studing the vcl of Lagoon, that the `PURGE`
  request actually is being translated into a `BAN` on `req.url`.
