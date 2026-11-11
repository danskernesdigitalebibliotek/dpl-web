<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Plugin\facets\processor;

use Drupal\Core\Form\FormStateInterface;
use Drupal\facets\FacetInterface;
use Drupal\facets\Processor\BuildProcessorInterface;
use Drupal\facets\Processor\PreQueryProcessorInterface;
use Drupal\facets\Processor\ProcessorPluginBase;
use function Safe\preg_match;
use function Safe\strtotime;

/**
 * Translates the date range in the URL to and from facet active items.
 *
 * The range is carried in the URL as
 * "<alias>:(min:<timestamp>,max:<timestamp>)" where either timestamp may be
 * empty.
 *
 * @FacetsProcessor(
 *   id = "dpl_event_date_range",
 *   label = @Translation("Event date range", context = "dpl_event"),
 *   description = @Translation("Show all events happening within the selected date range.", context = "dpl_event"),
 *   stages = {
 *     "pre_query" = 60,
 *     "build" = 20
 *   }
 * )
 */
class DateRangeProcessor extends ProcessorPluginBase implements PreQueryProcessorInterface, BuildProcessorInterface {

  /**
   * Placeholders in the URL template replaced client-side with the range.
   */
  public const MIN_PLACEHOLDER = '__date_range_min__';
  public const MAX_PLACEHOLDER = '__date_range_max__';

  /**
   * {@inheritdoc}
   *
   * Turns each active item into [from, to] timestamps for the query type. The
   * originally selected bounds are kept under "min"/"max" for the widget.
   */
  public function preQuery(FacetInterface $facet): void {
    $max_offset = $this->getConfiguration()['max_inclusive'] ? strtotime('+1 day', 0) - 1 : 0;
    $no_min = 0;
    $no_max = strtotime('+100 years');

    $active_items = array_map(function (string $item) use ($max_offset, $no_min, $no_max): array {
      if (!preg_match('/\(min:([^,]*),max:(.*)\)/i', $item, $matches)) {
        return [];
      }
      [, $min, $max] = $matches;

      $range = [
        $min !== '' ? (int) $min : $no_min,
        $max !== '' ? (int) $max + $max_offset : $no_max,
      ];
      if ($min !== '') {
        $range['min'] = $min;
      }
      if ($max !== '') {
        $range['max'] = $max;
      }
      return $range;
    }, $facet->getActiveItems());

    $facet->setActiveItems($active_items);
  }

  /**
   * {@inheritdoc}
   *
   * Replaces the facet's filter in each result URL with a template the
   * client-side picker fills in with the selected range.
   */
  public function build(FacetInterface $facet, array $results): array {
    /** @var \Drupal\facets\Plugin\facets\processor\UrlProcessorHandler $url_processor_handler */
    $url_processor_handler = $facet->getProcessors()['url_processor_handler'];
    $url_processor = $url_processor_handler->getProcessor();
    $filter_key = $url_processor->getFilterKey();
    $prefix = $facet->getUrlAlias() . $url_processor->getSeparator();

    /** @var \Drupal\facets\Result\ResultInterface[] $results */
    foreach ($results as $result) {
      $url = $result->getUrl();
      $query = $url->getOption('query');

      // Remove all the query filters for the field of the facet.
      foreach ($query[$filter_key] ?? [] as $id => $filter) {
        if (str_starts_with($filter . $url_processor->getSeparator(), $prefix)) {
          unset($query[$filter_key][$id]);
        }
      }

      $query[$filter_key][] = $prefix . '(min:' . self::MIN_PLACEHOLDER . ',max:' . self::MAX_PLACEHOLDER . ')';
      $url->setOption('query', $query);
      $result->setUrl($url);
    }
    return $results;
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state, FacetInterface $facet): array {
    $build['max_inclusive'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include through end of max date', [], ['context' => 'dpl_event']),
      '#default_value' => $this->getConfiguration()['max_inclusive'],
      '#description' => $this->t('Include events happening at any time of day on the max date. Otherwise events starting after 00:00:00 on the max date are excluded.', [], ['context' => 'dpl_event']),
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'max_inclusive' => FALSE,
    ];
  }

}
