<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Plugin\facets\widget;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\facets\FacetInterface;
use Drupal\facets\FacetSource\SearchApiFacetSourceInterface;
use Drupal\facets\Widget\WidgetPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * A pair of date inputs for filtering events by the period they happen in.
 *
 * The inputs carry no behaviour of their own. The novel theme replaces them
 * with a range picker which redirects to the URL template in drupalSettings.
 *
 * @see web/themes/custom/novel/js/date-range-facet.js
 *
 * @FacetsWidget(
 *   id = "dpl_event_date_range",
 *   label = @Translation("Event date range", context = "dpl_event"),
 *   description = @Translation("Filter events happening within a range of dates.", context = "dpl_event"),
 * )
 */
class DateRangeWidget extends WidgetPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected DateFormatterInterface $dateFormatter,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('date.formatter'),
    );
  }

  /**
   * {@inheritdoc}
   */
  // @phpstan-ignore missingType.iterableValue (Forms are complex)
  public function build(FacetInterface $facet): array {
    $build = parent::build($facet);
    $results = $facet->getResults();
    if (empty($results)) {
      return $build;
    }

    $active = $facet->getActiveItems();
    $active = reset($active) ?: [];
    $min = isset($active['min']) ? $this->dateFormatter->format((int) $active['min'], 'custom', 'Y-m-d') : NULL;
    $max = isset($active['max']) ? $this->dateFormatter->format((int) $active['max'], 'custom', 'Y-m-d') : NULL;

    $config = $this->getConfiguration();

    $build['#items'] = [
      'min' => $this->buildInput($facet, 'min', $config['min_label'], $min),
      'max' => $this->buildInput($facet, 'max', $config['max_label'], $max),
    ];

    $build['#attached']['drupalSettings']['facets']['daterange'][$facet->id()] = [
      'url' => reset($results)->getUrl()->toString(),
    ];

    return $build;
  }

  /**
   * Builds one of the two date inputs.
   *
   * @return mixed[]
   *   Render array for the input.
   */
  protected function buildInput(FacetInterface $facet, string $bound, string $label, ?string $value): array {
    $id = $facet->id() . '_' . $bound;
    return [
      '#type' => 'date',
      '#title' => $label,
      '#label_attributes' => [
        'for' => $id,
      ],
      '#value' => $value,
      '#attributes' => [
        'class' => ['facet-date-range'],
        'id' => $id,
        'name' => $id,
        'data-type' => 'date-range-' . $bound,
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function isPropertyRequired($name, $type): bool {
    return $name === 'dpl_event_date_range' && $type === 'processors';
  }

  /**
   * {@inheritdoc}
   *
   * @see \Drupal\dpl_event\Hook\DateRangeFacetHooks::facetsSearchApiQueryTypeMappingAlter()
   */
  public function getQueryType(): string {
    return 'dpl_event_date_range';
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state, FacetInterface $facet): array {
    $form += parent::buildConfigurationForm($form, $form_state, $facet);

    $config = $this->getConfiguration();

    $form['min_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Minimum date label', [], ['context' => 'dpl_event']),
      '#default_value' => $config['min_label'],
    ];

    $form['max_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Maximum date label', [], ['context' => 'dpl_event']),
      '#default_value' => $config['max_label'],
    ];

    $form['end_field'] = [
      '#type' => 'select',
      '#title' => $this->t('End date field', [], ['context' => 'dpl_event']),
      '#description' => $this->t('Items are shown when the period from the facet field to this field overlaps the selected range. Leave empty to only show items where the facet field is within the range.', [], ['context' => 'dpl_event']),
      '#options' => $this->dateFieldOptions($facet),
      '#empty_value' => '',
      '#default_value' => $config['end_field'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'min_label' => 'Date from',
      'max_label' => 'Date to',
      'end_field' => '',
    ] + parent::defaultConfiguration();
  }

  /**
   * Lists the date fields of the facet's search index.
   *
   * @return string[]
   *   Field labels keyed by field identifier.
   */
  protected function dateFieldOptions(FacetInterface $facet): array {
    $source = $facet->getFacetSource();
    if (!$source instanceof SearchApiFacetSourceInterface) {
      return [];
    }

    $options = [];
    foreach ($source->getIndex()->getFields() as $field_id => $field) {
      if ($field->getType() === 'date') {
        $options[$field_id] = $field->getLabel() ?? '';
      }
    }

    return $options;
  }

}
