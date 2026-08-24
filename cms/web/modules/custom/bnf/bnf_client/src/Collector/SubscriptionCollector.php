<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Collector;

use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_metrics\Collector\MetricCollectorInterface;
use Drupal\dpl_metrics\MetricsRegistry;

/**
 * Reports which BNF content streams a site subscribes to.
 *
 * A stream is a taxonomy term on delingstjenesten.dk, and a subscription is
 * one site's standing order for the content filed under it. Each site only
 * knows its own subscriptions, so the question the BNF team actually has -
 * how many of the 100+ library sites take a given stream - can only be
 * answered once the subscriptions are gathered somewhere central. Prometheus
 * already scrapes every site, so reporting them here answers it with:
 *
 * @code
 * count by (stream) (dpl_cms_bnf_subscription_info)
 * @endcode
 *
 * Streams are identified by UUID because that is the only identifier meaning
 * the same thing on every site. Names come from delingstjenesten.dk, which
 * publishes them as their own metric for the query above to join onto.
 *
 * Derivable from the database and therefore a collector: subscriptions are
 * state, not events, so there is nothing to count as it happens.
 *
 * @see \Drupal\bnf_server\Collector\StreamCollector
 */
class SubscriptionCollector implements MetricCollectorInterface {

  /**
   * Placeholder for a subscription that carries no name.
   *
   * The name is optional on the entity, and a label that is present but
   * visibly wrong beats one that disappears: an empty string would look like
   * a rendering fault, and dropping the series would hide a real subscription.
   */
  private const UNNAMED = 'unknown';

  /**
   * Constructs a subscription collector.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Used to load the site's subscriptions.
   */
  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public function collect(MetricsRegistry $registry): void {
    $streams = $this->streams();

    // Reported separately rather than left to count by (stream), because that
    // cannot produce a zero: a site that subscribes to nothing emits no info
    // series at all, and would be indistinguishable from one that is not
    // reporting. This gauge is the denominator that tells the two apart.
    $registry->setGauge(
      'bnf_subscriptions',
      'Number of BNF content streams this site subscribes to.',
      count($streams),
    );

    foreach ($streams as $uuid => $name) {
      $registry->setGauge(
        'bnf_subscription_info',
        'A BNF content stream this site subscribes to. Always 1 - read the labels.',
        1,
        // An info metric, so that the stream identity lives in labels where
        // Prometheus can group by it. The project and environment naming the
        // site are added by the registry.
        //
        // Labelling by UUID would normally be exactly the cardinality
        // mistake the registry warns about. It is safe here because the
        // values are not this site's to invent: a stream only appears once a
        // librarian has gone to delingstjenesten.dk and subscribed to it, so
        // a site contributes the handful it actually takes, and the same
        // value means the same thing on every site - which is what makes the
        // metric worth collecting at all.
        [
          'stream' => (string) $uuid,
          // What this library calls the stream, which is the term name as
          // it stood when they subscribed, unless they have renamed it
          // since. Carried so that a scrape read on its own is legible;
          // the authoritative, current name is the one delingstjenesten.dk
          // publishes. Two sites can name one stream differently, so group
          // by 'stream' when counting, never by this.
          'name' => $name,
        ],
      );
    }
  }

  /**
   * Loads the streams this site subscribes to.
   *
   * Loading the entities on every scrape is cheap: a site has a handful of
   * subscriptions, and they are entity-cached between requests.
   *
   * @return array<string, string>
   *   Stream UUID mapped to the local name of the subscription.
   */
  private function streams(): array {
    $subscriptions = $this->entityTypeManager
      ->getStorage('bnf_subscription')
      ->loadMultiple();

    $streams = [];

    foreach ($subscriptions as $subscription) {
      if (!$subscription instanceof Subscription) {
        continue;
      }

      $uuid = $subscription->getSubscriptionUuid();

      // Nothing prevents two subscriptions to the same stream - the UI steers
      // editors to the existing one, but does not enforce it. Keying by UUID
      // collapses them, so that such a site still counts once towards the
      // stream rather than twice.
      if ($uuid === '' || isset($streams[$uuid])) {
        continue;
      }

      $name = (string) ($subscription->label() ?? '');

      $streams[$uuid] = $name !== '' ? $name : self::UNNAMED;
    }

    return $streams;
  }

}
