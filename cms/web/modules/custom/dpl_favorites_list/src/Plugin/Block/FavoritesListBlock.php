<?php

namespace Drupal\dpl_favorites_list\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user favorites list.
 *
 * @Block(
 *   id = "dpl_favorites_list_block",
 *   admin_label = "List user favorites"
 * )
 */
class FavoritesListBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Drupal config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private ConfigFactoryInterface $configFactory;

  /**
   * FavoritesListBlock constructor.
   *
   * @param array $configuration
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
    $loanListSettings = $this->configFactory->get('loan_list.settings');
    $context = ['context' => 'Loan list'];
    $contextAria = ['context' => 'Loan list (Aria)'];
    $fbsConfig = $this->configFactory->get('dpl_fbs.settings');
    $publizonConfig = $this->configFactory->get('dpl_publizon.settings');
    $data = [
      // Page sige.
      "page-size-desktop" => $loanListSettings->get('page_size_desktop'),
      "page-size-mobile" => $loanListSettings->get('page_size_mobile'),
            'group-modal-checkbox-text' => $this->t("Choose all renewable", [], $context),

  "favorites-list-materials-text" => $this->t("@count materials"),
  "favorites-list-header-text" => $this->t("Favorites"),
  "by-author-text" => $this->t("By"),
  "et-al-text" => $this->t("..."),
  "show-more-text" => $this->t("show more"),
  "result-pager-status-text" => $this->t(),
  "favorites-list-empty-text" => $this->t("Your favorites list is empty"),
  "in-series-text" => $this->t("in series"),
  "number-description-text" => $this->t("Number description"),

    ] + DplReactAppsController::externalApiBaseUrls();

    $app = [
      '#theme' => 'dpl_react_app',
      "#name" => 'favorites-list',
      '#data' => $data,
    ];

    return $app;

  }

}
