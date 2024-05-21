<?php

namespace Drupal\dpl_patron_reg\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_library_agency\ReservationSettings;
use Drupal\dpl_patron_page\DplPatronPageSettings;
use Drupal\dpl_patron_reg\DplPatronRegSettings;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides user registration block.
 *
 * @Block(
 *   id = "dpl_patron_reg_block",
 *   admin_label = "Patron registration"
 * )
 */
class PatronRegistrationBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * PatronRegistrationBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch-settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch-settings for getting branches.
   * @param \Drupal\dpl_library_agency\ReservationSettings $reservationSettings
   *   Reservation settings.
   * @param \Drupal\dpl_react\DplReactConfigInterface $patronPageSettings
   *   Patron page settings.
   * @param \Drupal\dpl_react\DplReactConfigInterface $patronRegSettings
   *   Patron registration settings.
   */
  public function __construct(
    array $configuration,
    string $plugin_id,
    array $plugin_definition,
    private BranchSettings $branchSettings,
    private BranchRepositoryInterface $branchRepository,
    protected ReservationSettings $reservationSettings,
    private DplReactConfigInterface $patronPageSettings,
    private DplReactConfigInterface $patronRegSettings
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
      $container->get('dpl_library_agency.reservation_settings'),
      \Drupal::service('dpl_patron_page.settings'),
      \Drupal::service('dpl_patron_reg.settings'),
    );
  }

  /**
   * Builds a comma separated list of branch ids.
   *
   * This is to be used as props/attributes for React apps.
   *
   * @param string[] $branchIds
   *   The ids of the branches to use.
   */
  protected function buildBranchesListProp(array $branchIds) : string {
    return implode(',', $branchIds);
  }

  /**
   * {@inheritDoc}
   *
   * @return mixed[]
   *   The app render array.
   *
   * @throws \Safe\Exceptions\JsonException
   */
  public function build(): array {
    $config = $this->patronRegSettings->loadConfig();
    $patron_page_settings = $this->patronPageSettings->loadConfig();
    $redirect_on_user_created_url = $config->get('redirect_on_user_created_url') ?? dpl_react_apps_ensure_url_is_string(
      Url::fromRoute('dpl_dashboard.list')->toString()
    );

    $data = [
      // Configuration.
      'blacklisted-pickup-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
      'min-age-config' => $config->get('age_limit') ?? DplPatronRegSettings::AGE_LIMIT,
      'pincode-length-max-config' => $patron_page_settings->get('pincode_length_max') ?? DplPatronPageSettings::PINCODE_LENGTH_MAX,
      'pincode-length-min-config' => $patron_page_settings->get('pincode_length_min') ?? DplPatronPageSettings::PINCODE_LENGTH_MIN,
      'text-notifications-enabled-config' => (int) $this->reservationSettings->smsNotificationsIsEnabled(),

      // Texts.
      'create-patron-branch-dropdown-note-text' => $this->t("Choose preferred library for pickup of your future reservations.", [], ['context' => 'Create patron']),
      'create-patron-button-error-text' => $this->t("Error occurred", [], ['context' => 'Create patron']),
      'create-patron-button-loading-text' => $this->t("Loading", [], ['context' => 'Create patron']),
      'create-patron-cancel-button-text' => $this->t("Cancel", [], ['context' => 'Create patron']),
      'create-patron-change-pickup-body-text' => $this->t("Select pickup location in the select", [], ['context' => 'Create patron']),
      'create-patron-change-pickup-header-text' => $this->t("Select pickup location", [], ['context' => 'Create patron']),
      'create-patron-confirm-button-text' => $this->t("Confirm", [], ['context' => 'Create patron']),
      'create-patron-header-text' => $this->t("Register as patron", [], ['context' => 'Create patron']),
      'create-patron-invalid-ssn-body-text' => $this->t("This SSN is invalid", [], ['context' => 'Create patron']),
      'create-patron-invalid-ssn-header-text' => $this->t("Invalid SSN", [], ['context' => 'Create patron']),
      'patron-contact-name-label-text' => $this->t("Name", [], ['context' => 'Create patron']),
      'post-register-redirect-info-bottom-text' => $this->t("You will be sent to the Adgangsplatformen to log in again in @seconds seconds.", [], ['context' => 'Create patron']),
      'post-register-redirect-info-top-text' => $this->t("You are now registered as a user and need to log in again to be able to use the application.", [], ['context' => 'Create patron']),
      'post-register-redirect-button-text' => $this->t("Log in again", [], ['context' => 'Create patron']),

      // Urls.
      'redirect-on-user-created-url' => $redirect_on_user_created_url,
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'create-patron',
      '#data' => $data,
    ];
  }

}
