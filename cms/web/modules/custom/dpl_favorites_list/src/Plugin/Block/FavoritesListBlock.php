<?php

namespace Drupal\dpl_favorites_list\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
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
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch settings for getting branches.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactoryInterface $configFactory, protected BranchSettings $branchSettings, protected BranchRepositoryInterface $branchRepository) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configuration = $configuration;
    $this->configFactory = $configFactory;
    $this->branchSettings = $branchSettings;
    $this->branchRepository = $branchRepository;
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
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
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
    $favoritesListSettings = $this->configFactory->get('favorites_list.settings');

    $data = [
      // Branches.
      'blacklisted-availability-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedAvailabilityBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),

      // Page size.
      "page-size-desktop" => $favoritesListSettings->get('page_size_desktop'),
      "page-size-mobile" => $favoritesListSettings->get('page_size_mobile'),

      // Texts.
      'group-modal-checkbox-text' => $this->t("Choose all renewable", [], ['context' => 'Loan list']),
      "favorites-list-materials-text" => $this->t("@count materials", [], ['context' => 'Loan list']),
      "favorites-list-header-text" => $this->t("Favorites", [], ['context' => 'Loan list']),
      "by-author-text" => $this->t("By", [], ['context' => 'Loan list']),
      "et-al-text" => $this->t("...", [], ['context' => 'Loan list']),
      "show-more-text" => $this->t("show more", [], ['context' => 'Loan list']),
      "result-pager-status-text" => $this->t("Showing @itemsShown out of @hitcount results", [], ['context' => 'Loan list']),
      "favorites-list-empty-text" => $this->t("Your favorites list is empty", [], ['context' => 'Loan list']),
      "in-series-text" => $this->t("in series", [], ['context' => 'Loan list']),
      "number-description-text" => $this->t("Number description", [], ['context' => 'Loan list']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'favorites-list',
      '#data' => $data,
    ];
  }

}
