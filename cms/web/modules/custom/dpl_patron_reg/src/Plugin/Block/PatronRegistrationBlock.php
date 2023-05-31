<?php

namespace Drupal\dpl_patron_reg\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_login\UserTokensProvider;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use function Safe\json_encode as json_encode;

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
   * ReservationListBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dpl_login\UserTokensProvider $user_token_provider
   *   The user token provider from single sing on.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Drupal config factory to get FBS and Publizon settings.
   * @param \Drupal\dpl_library_agency\BranchSettings $branchSettings
   *   The branch-settings for branch config.
   * @param \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface $branchRepository
   *   The branch-settings for getting branches.
   * @param \Drupal\dpl_react\DplReactConfigInterface $patronRegSettings
   *   Patron registration settings.
   */
  public function __construct(
    array $configuration,
    string $plugin_id,
    array $plugin_definition,
    private UserTokensProvider $user_token_provider,
    private ConfigFactoryInterface $configFactory,
    private BranchSettings $branchSettings,
    private BranchRepositoryInterface $branchRepository,
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
      $container->get('dpl_login.user_tokens'),
      $container->get('config.factory'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      \Drupal::service('dpl_patron_reg.settings')
    );
  }

  /**
   * Build a string of JSON data containing information about branches.
   *
   * Uses the format:
   *
   * [{
   *    "branchId":"DK-775120",
   *    "title":"Højbjerg"
   * }, {
   *    "branchId":"DK-775122",
   *    "title":"Beder-Malling"
   * }]
   *
   * This is to be used as props/attributes for React apps.
   *
   * @param \Drupal\dpl_library_agency\Branch\Branch[] $branches
   *   The branches to build the string with.
   *
   * @throws \Safe\Exceptions\JsonException
   */
  protected function buildBranchesJsonProp(array $branches) : string {
    return json_encode(array_map(function (Branch $branch) {
      return [
        'branchId' => $branch->id,
        'title' => $branch->title,
      ];
    }, $branches));
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
    $userToken = $this->user_token_provider->getAccessToken()?->token;

    // @todo change to use patron_page settings inject, if approved in other PR.
    $patron_page_settings = $this->configFactory->get('patron_page.settings');

    $data = [
      // Configuration.
      'blacklisted-pickup-branches-config' => $this->buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
      'branches-config' => $this->buildBranchesJsonProp($this->branchRepository->getBranches()),
      'min-age-config' => $config->get('age_limit') ?? '18',
      'pincode-length-max-config' => $patron_page_settings->get('pincode_length_max'),
      'pincode-length-min-config' => $patron_page_settings->get('pincode_length_min'),
      'redirect-on-user-created-url' => $config->get('redirect_on_user_created_url'),
      'user-token' => $userToken,

      // Texts.
      'create-patron-cancel-button-text' => $this->t("Cancel", [], ['context' => 'Create patron']),
      'create-patron-change-pickup-body-text' => $this->t("create patron change pickup body text", [], ['context' => 'Create patron']),
      'create-patron-change-pickup-header-text' => $this->t("create patron change pickup header text", [], ['context' => 'Create patron']),
      'create-patron-confirm-button-text' => $this->t("Confirm", [], ['context' => 'Create patron']),
      'create-patron-header-text' => $this->t("Register as patron", [], ['context' => 'Create patron']),
      'create-patron-invalid-ssn-body-text' => $this->t("This SSN is invalid", [], ['context' => 'Create patron']),
      'create-patron-invalid-ssn-header-text' => $this->t("Invalid SSN", [], ['context' => 'Create patron']),
      'patron-contact-email-checkbox-text' => $this->t("Receive emails about your loans, reservations, and so forth", [], ['context' => 'Create patron']),
      'patron-contact-email-label-text' => $this->t("E-mail", [], ['context' => 'Create patron']),
      'patron-contact-info-body-text' => $this->t("contact info body text", [], ['context' => 'Create patron']),
      'patron-contact-info-header-text' => $this->t("contact info header text", [], ['context' => 'Create patron']),
      'patron-contact-name-label-text' => $this->t("Name", [], ['context' => 'Create patron']),
      'patron-contact-phone-checkbox-text' => $this->t("Receive text messages about your loans, reservations, and so forth", [], ['context' => 'Create patron']),
      'patron-contact-phone-label-text' => $this->t("Phone number", [], ['context' => 'Create patron']),
      'patron-page-change-pincode-body-text' => $this->t("Change current pin by entering a new pin and saving", [], ['context' => 'Create patron']),
      'patron-page-change-pincode-header-text' => $this->t("Pincode", [], ['context' => 'Create patron']),
      'patron-page-confirm-pincode-label-text' => $this->t("Confirm new pin", [], ['context' => 'Create patron']),
      'patron-page-pincode-label-text' => $this->t("New pin", [], ['context' => 'Create patron']),
      'patron-page-pincode-too-short-validation-text' => $this->t("The pincode should be minimum @pincodeLengthMin and maximum @pincodeLengthMax characters long", [], ['context' => 'Create patron']),
      'patron-page-pincodes-not-the-same-text' => $this->t("The pincodes are not the same", [], ['context' => 'Create patron']),
      'pickup-branches-dropdown-label-text' => $this->t("Choose pickup branch", [], ['context' => 'Create patron']),
      'pickup-branches-dropdown-nothing-selected-text' => $this->t("Nothing selected", [], ['context' => 'Create patron']),
    ] + DplReactAppsController::externalApiBaseUrls();

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'create-patron',
      '#data' => $data,
    ];
  }

}
