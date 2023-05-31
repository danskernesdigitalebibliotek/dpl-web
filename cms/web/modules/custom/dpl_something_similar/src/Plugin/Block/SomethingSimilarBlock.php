<?php

namespace Drupal\dpl_something_similar\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a "something similar" component.
 *
 * @Block(
 *   id = "dpl_something_similar_block",
 *   admin_label = "Something similar"
 * )
 */
class SomethingSimilarBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

  /**
   * SomethingSimilarBlock constructor.
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
   * @return \Drupal\dpl_something_similar\Plugin\Block\SomethingSimilarBlock|static
   *   Something similar.
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
      'faust' => self::faustFromUrl(),
      'material-url' => DplReactAppsController::materialUrl(),

      // Texts.
      'add-to-favorites-aria-label-text' => $this->t("Add element to favorites list", [], ['context' => 'Something similar (Aria)']),
      'material-and-author-text' => $this->t("and", [], ['context' => 'Something similar']),
      'material-by-author-text' => $this->t("By", [], ['context' => 'Something similar']),
      'remove-from-favorites-aria-label-text' => $this->t("Remove element from favorites list", [], ['context' => 'Something similar (Aria)']),
      'something-similar-by-the-same-author-text' => $this->t("By the same author", [], ['context' => 'Something similar']),
      'something-similar-something-similar-author-text' => $this->t("Something similar", [], ['context' => 'Something similar']),
      'something-similar-title-text' => $this->t("Other materials", [], ['context' => 'Something similar']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'something-similar',
      '#data' => $data,
    ];
  }

  /**
   * Get faust from url.
   */
  public static function faustFromUrl(): string {
    return \Drupal::routeMatch()->getParameters()->get('faust');
  }

}
