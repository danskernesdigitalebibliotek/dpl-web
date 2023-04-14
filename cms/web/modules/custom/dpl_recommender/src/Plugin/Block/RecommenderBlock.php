<?php

namespace Drupal\dpl_recommender\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Url;

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
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

  /**
   * RecommenderBlock constructor.
   *
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
    $this->configFactory = $configFactory;
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
      $container->get('config.factory'),
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   */
  public function build() {
    $data = [
      // Urls.
      'dpl-cms-base-url' => DplReactAppsController::dplCmsBaseUrl(),
      'material-url' => DplReactAppsController::materialUrl(),
      'empty-recommender-search-config' => 'Mimbo jimbo',
      'recommender-title-loans-text' => $this->t("Because you have borrowed @title you may also like",[],['context' => 'Recommender']),
      'recommender-title-reservations-text' => $this->t("Because you have reserved @title you may also like",[],['context' => 'Recommender']),
      'material-by-author-text' => $this->t("By",[],['context' => 'Recommender']),
      'material-and-author-text' => $this->t("and",[],['context' => 'Recommender']),
      'recommender-title-inspiration-text' => $this->t("For your inspiration",[],['context' => 'Recommender']),
      'add-to-favorites-aria-label-text' => $this->t("Add element to favorites list", [], ['context' => 'Recommender (Aria)']),
      'remove-from-favorites-aria-label-text' => $this->t("Remove element from favorites list", [], ['context' => 'Recommender (Aria)']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'recommender',
      '#data' => $data,
    ];
  }

}
