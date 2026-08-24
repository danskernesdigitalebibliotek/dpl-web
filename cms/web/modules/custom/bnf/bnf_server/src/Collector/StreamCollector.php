<?php

declare(strict_types=1);

namespace Drupal\bnf_server\Collector;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_metrics\Collector\MetricCollectorInterface;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\taxonomy\TermInterface;

/**
 * Publishes the names of the content streams libraries can subscribe to.
 *
 * A stream is a taxonomy term here on the BNF site, and library sites report
 * their subscriptions by its UUID - the only identifier that means the same
 * thing on all of them. That makes the subscription metric join-able but
 * unreadable, so this collector supplies the missing half: the authoritative
 * name, published by the one site that owns it.
 *
 * The two are meant to be joined at query time, which keeps the name in one
 * place and current. A dashboard counting subscribers per stream reads:
 *
 * @code
 * count by (stream) (dpl_cms_bnf_subscription_info)
 *   * on (stream) group_left(name) dpl_cms_bnf_stream_info
 * @endcode
 *
 * Doing it this way rather than having each library ask us for the name is
 * deliberate. A lookup at scrape time would put 100+ sites on our door every
 * scrape interval, and would add a network call to the one code path that
 * must never be slow. Prometheus already collects from both ends; letting it
 * do the join costs nothing.
 *
 * Series count is the number of terms in the vocabularies below, on this one
 * site - libraries do not multiply it. Categories are curated, but editors
 * create tags freely as they write, so this grows with the taxonomy. Should
 * that get out of hand, the fix is to publish only terms some content is
 * actually filed under; a term nobody can reach a listing page for is not a
 * stream anyone can subscribe to.
 *
 * @see \Drupal\bnf_client\Collector\SubscriptionCollector
 */
class StreamCollector implements MetricCollectorInterface {

  /**
   * Vocabularies whose terms libraries can subscribe to.
   *
   * These are the two the shareable content types file their content under,
   * and therefore the only terms with a listing page carrying a subscribe
   * button.
   *
   * @see bnf_server_preprocess_page()
   */
  private const VOCABULARIES = ['categories', 'tags'];

  /**
   * Constructs a stream collector.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Used to load the subscribable terms.
   */
  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public function collect(MetricsRegistry $registry): void {
    $terms = $this->entityTypeManager
      ->getStorage('taxonomy_term')
      ->loadByProperties(['vid' => self::VOCABULARIES]);

    foreach ($terms as $term) {
      if (!$term instanceof TermInterface) {
        continue;
      }

      $registry->setGauge(
        'bnf_stream_info',
        'A content stream libraries can subscribe to. Always 1 - read the labels.',
        1,
        [
          'stream' => (string) $term->uuid(),
          'name' => (string) $term->getName(),
          // Lets a dashboard separate the curated categories from tags,
          // which editors create freely while writing.
          'vocabulary' => $term->bundle(),
        ],
      );
    }
  }

}
