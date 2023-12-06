<?php

namespace Drupal\dpl_favorites_list\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_favorites_list\DplFavoritesListSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;

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
   * FavoritesListBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch settings for getting branches.
   * @param \Drupal\dpl_react\DplReactConfigInterface $favoritesListSettings
   *   Favorites list settings.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private BranchSettings $branchSettings,
    private BranchRepositoryInterface $branchRepository,
    private DplReactConfigInterface $favoritesListSettings
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      \Drupal::service('dpl_favorites_list.settings')
    );
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   *
   * @throws \Safe\Exceptions\JsonException
   */
  public function build() {
    $favoritesListSettings = $this->favoritesListSettings->loadConfig();

    $data = [
      // Branches.
      'blacklisted-availability-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),

      // Page size.
      "page-size-desktop" => $favoritesListSettings->get('page_size_desktop') ?? DplFavoritesListSettings::PAGE_SIZE_DESKTOP,
      "page-size-mobile" => $favoritesListSettings->get('page_size_mobile') ?? DplFavoritesListSettings::PAGE_SIZE_MOBILE,

      // Texts.
      "favorites-list-empty-text" => $this->t("Your favorites list is empty", [], ['context' => 'Favorites list']),
      "favorites-list-header-text" => $this->t("Favorites", [], ['context' => 'Favorites list']),
      "favorites-list-materials-text" => $this->t("@count materials", [], ['context' => 'Favorites list']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'favorites-list',
      '#data' => $data,
    ];
  }

}
