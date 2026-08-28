# Application metrics

## Context

We want visibility into how the CMS is actually used across the 100+
library sites: how often patrons log in, how often reservations are
created, how often an integration fails. Watchdog logging answers
"what happened once"; it does not answer "how often, and is that
changing".

The metrics we care about fall into two groups, and the distinction
drives most of what follows:

- **Derivable state.** Anything computable from data we already store:
  the deployed version, a queue depth, a row count. These need no
  bookkeeping — they can be read at the moment a monitoring system asks.
- **Events leaving no durable trace.** Syncronization with BNF failed,
  3rd party API had an error. Nothing in the database records that it 
  happened, so it has to be counted as it occurs.

The second group constrains the design. PHP-FPM handles each request in
a worker that is recycled, and `nginx-php` can run as multiple pods in
Lagoon, so a counter held in process memory is both lost on recycle and
different on every pod. Counting events therefore requires storage
shared by all workers of a site.

Our hosting is Lagoon, operated through the sibling `dpl-platform`
repository, and it already runs Prometheus and Grafana. Whatever we
emit has to end up there.

## Decision

We expose metrics as a **Prometheus scrape endpoint** — the classic pull
model — served by a small custom module, `dpl_metrics`, built directly
on the [PromPHP client library][promphp].

[promphp]: https://github.com/PromPHP/prometheus_client_php

PromPHP is the only maintained PHP client that ships storage adapters,
which the event counting above requires; the alternatives are compared
below.

The module provides a `MetricsRegistry` service with
`incrementCounter()` and `setGauge()`, a `/metrics` controller, and a
token-based access check. Two supporting choices follow from the
context above:

- **Counters are stored in a dedicated Redis instance**, separate from
  the one backing Drupal's cache. The cache instance runs an
  `allkeys-lru` eviction policy and is flushed wholesale by
  `dev-scripts/flush-redis-cache.php`; either would corrupt counters.
  Prometheus is the durable store, so this instance only has to hold
  values between scrapes.
- **Derivable state is gathered by collectors at scrape time**, into
  throwaway in-process storage rather than Redis. A collected value
  written to shared storage would outlive what it described — after a
  deploy the endpoint would report the old and the new version side by
  side, each claiming to be current.

## Alternatives considered

### OpenTelemetry instead of Prometheus scraping

- OTel is vendor-neutral and supports metrics, traces and logs under the
  same instrumentation, but this requires an OTel collector (like Grafana Alloy)
  to be always running, ready to process incoming telemetry.
- The PHP SDK's metrics support is less mature than the Prometheus
  client library, and its push model puts a network dependency on the
  request path — a failure mode we would rather not add to a patron's
  page load.
- Logging is already handled via Kubernetes.
- Thus, we would need to rework our Prometheus/Grafana for not much gain but at
  the cost of additional complexity.
- We have no consumer for traces today. Adopting OTel now would buy an
  abstraction over a destination we are not planning to change.
- This is reversible at moderate cost. The durable artifact is the set
  of metric names and labels, not the transport; an OTel migration
  later can preserve them.

### `drupal/prometheus_exporter`

The strongest contrib option on paper: covered by Drupal's security
advisory policy, stable 2.1.0 supporting `^11.1 || ^12`, roughly 398
reporting sites, a clean plugin API, and a submodule for token access.

It is nonetheless the wrong shape for us. It has no shared storage at
all — every metric is computed during the scrape. That covers derivable
state well and event counting not at all, which is the group we
actually need. Its stable release also requires Drupal 11.1, while we
are on 10.6.9 until the upgrade lands.

We may still adopt it later for derivable state, where its collector
library would save us work.

### `drupal/prometheus_metrics`

Functionally the closest match: it wraps the same PromPHP library,
supports a Redis backend, and adds request histograms and entity CRUD
counters.

- It is **not covered by the security advisory policy**, with ~28
  reporting sites and 43 commits over six years, 36 of them from a
  single author. On a distribution serving 100+ public library sites
  that is a meaningful exposure.
- Its stable 1.1.0 targets `^11` only (we're still on 10).
- Roughly 73% of its 1,835 lines implement features we do not want, or at a
  cardinality higher than our needs:
  request-timing middleware, entity CRUD counters, config forms, and
  rebuild machinery.
- Decisively, its request and entity-CRUD subscribers **write to Redis
  on every request and cannot be switched off** — `metrics_exclude_routes`
  suppresses per-route series but still records aggregates. Avoiding
  that cost means overriding its service definitions from day one, so
  we would be carrying both the dependency and a patch against it.
- Its security defaults are loose: `require_auth` has a schema default
  of `false`, and an update hook grants the metrics permission to every
  role holding `access content`, anonymous included. That hook does not
  run on a fresh install, so it is not an active risk for us, but it
  indicates how the module reasons about exposure.

### Other PHP Prometheus client libraries

Once we decided to write the wrapper ourselves, the library underneath
it became a real choice rather than an inherited one.

- There is **no official Prometheus client for PHP**. The Prometheus
  project's own list of client libraries names exactly one PHP entry,
  under third-party libraries, and that entry is PromPHP.
- Most apparent alternatives are the same codebase's lineage rather
  than competitors. `jimdo/prometheus_client_php` is the original and
  is marked abandoned, with no stable release since 2017.
  `lkaemmerling/prometheus_client_php` is marked abandoned pointing
  explicitly at PromPHP — the same maintainer after an organisation
  rename. `endclothing/prometheus_client_php` is a fork whose last
  stable release was 2019.
- `bexiocom/prometheus_php` is an independent implementation, but
  targets PHP 5.5 through 7.1. We run 8.4.
- `previousnext/php-prometheus` is the one genuinely independent and
  actively maintained alternative, and is what
  `drupal/prometheus_exporter` builds on. It describes itself as "a PHP
  library for serializing to the prometheus text format", and that is
  exactly what it is: counters, gauges and a serializer, with **no
  storage adapters**. It cannot hold a value between requests, which is
  the entire reason our event counting exists. This is the same
  limitation that rules out `prometheus_exporter` above.

PromPHP is therefore not simply the popular option but the only
maintained PHP client shipping the shared-storage adapters (Redis,
APCu) the design depends on. The surrounding ecosystem has converged on
it as well: `artprima/prometheus-metrics-bundle`, the standard Symfony
integration, is built on it, as is `drupal/prometheus_metrics`. At the
time of writing it sees around a million downloads a month against
roughly eight thousand for the nearest maintained alternative.

### Writing our own wrapper

The chosen option. `dpl_metrics` is roughly 500 lines including
docblocks, most of it a thin shell around `CollectorRegistry`.

- We own the code and get no community fixes.
- In exchange, the distribution carries no security-uncovered contrib
  module, and we touch only the Drupal API surface we need — one
  service, one controller, one access check. Drupal major upgrades on
  that little plain service code are cheap and largely handled by
  Rector, which this repository already runs.
- The dependency most likely to need real attention,
  `promphp/prometheus_client_php`, is identical under every option.

## Consequences

1. **Event counting works across workers and pods.**
   - **Pros:** Counters survive worker recycling and are consistent
     across pods, because every pod reads and writes the same store.
   - **Cons:** Prometheus must scrape **one target per site**, via the
     site URL, not per pod. Every pod renders the same Redis-backed
     aggregate, so summing across pod-level targets would multiply
     every value by the pod count.
2. **A second Redis instance per environment.**
   - **Pros:** Cache flushes and LRU eviction can no longer corrupt
     counters, and the metrics store can run `noeviction` while the
     cache keeps `allkeys-lru`.
   - **Cons:** One more service per environment, which has to be added
     to `dpl-platform` for production as well as to the compose files
     here. Environments without it fall back to per-process storage,
     where counters do not accumulate.
3. **Metrics never break a page.**
   - **Pros:** Writes are wrapped so that an unreachable or full
     metrics store is logged once per request and otherwise ignored. A
     monitoring outage cannot return an error to a patron.
   - **Cons:** Silent degradation. A misconfigured store shows up as
     missing data rather than a loud failure, so the absence of metrics
     needs alerting in its own right.
4. **We maintain the module.**
   - **Pros:** It stays as small as our needs, and we can extend it —
     new collectors register by tagging a service.
   - **Cons:** Drupal major upgrades and PromPHP changes are ours to
     handle, without a maintainer upstream doing it first.
5. **Every metric carries the site it came from.**
   - **Pros:** `project` and `environment`, from the Lagoon environment
     variables, are attached to all metrics by default, so a scrape is
     self-describing and sites stay distinguishable in a shared
     Prometheus. Within one site both values are constant, so this
     costs bytes in the scrape body rather than extra time series.
   - **Cons:** It duplicates what Prometheus can attach by relabelling
     the scrape target. If that is configured too, `honor_labels` has
     to be set deliberately or the two will conflict.
