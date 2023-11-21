<?php

namespace Drupal\dpl_recommender\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Drupal\dpl_recommender\DplRecommenderSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a "recommender" component.
 *
 * @Block(
 *   id = "dpl_recommender_block",
 *   admin_label = "Recommender"
 * )
 */
class RecommenderBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * RecommenderBlock constructor.
   *
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_react\DplReactConfigInterface $recommenderSettings
   *   Recommender settings.
   */
  public function __construct(
      array $configuration,
      $plugin_id,
      $plugin_definition,
      private DplReactConfigInterface $recommenderSettings
    ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
  }

  /**
   * {@inheritDoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The service container.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param int $plugin_definition
   *   The plugin implementation definition.
   *
   * @return \Drupal\dpl_recommender\Plugin\Block\RecommenderBlock|static
   *   Recommender.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
       \Drupal::service('dpl_recommender.settings'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $recommenderSettings = $this->recommenderSettings->loadConfig();

    $data = [] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'recommender',
      '#data' => $data,
    ];
  }

}
