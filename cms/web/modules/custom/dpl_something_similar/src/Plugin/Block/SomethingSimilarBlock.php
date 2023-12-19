<?php

namespace Drupal\dpl_something_similar\Plugin\Block;

use Drupal\Core\Block\BlockBase;
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
      'faust' => self::faustFromUrl(),

      // Texts.
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
