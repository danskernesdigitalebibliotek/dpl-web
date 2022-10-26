<?php

namespace Drupal\dpl_library_agency\Form;

use DanskernesDigitaleBibliotek\FBS\ApiException;
use Drupal\Core\Cache\CacheTagsInvalidator;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\ReservationSettings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\array_combine as array_combine;
use function Safe\sort as sort;

/**
 * General Settings form for a library agency.
 */
class GeneralSettingsForm extends ConfigFormBase {

  /**
   * The cache tags invalidator.
   *
   * @var \Drupal\Core\Cache\CacheTagsInvalidator
   */
  protected $cacheTagsInvalidator;

  /**
   * Branch API instance for fetching branch information.
   *
   * @var \Drupal\dpl_library_agency\Branch\BranchRepositoryInterface
   */
  protected $branchRepository;

  /**
   * GeneralSettingsForm constructor.
   */
  public function __construct(
    CacheTagsInvalidator $cacheTagsInvalidator,
    BranchRepositoryInterface $branchApi,
  ) {
    $this->cacheTagsInvalidator = $cacheTagsInvalidator;
    $this->branchRepository = $branchApi;
  }

  /**
   * {@inheritdoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The Drupal service container.
   *
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('cache_tags.invalidator'),
      $container->get('dpl_library_agency.branch.repository.cache')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'dpl_library_agency_general_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'dpl_library_agency.general_settings',
    ];
  }

  /**
   * Translates a string to the current language or to a given language.
   *
   * @param string $string
   *   A string containing the English text to translate.
   * @param mixed[] $args
   *   Replacements to make after translation. Based on the first character of
   *   the key, the value is escaped and/or themed.
   * @param mixed[] $options
   *   An associative array of additional options.
   */
  protected function t($string, array $args = [], array $options = []): TranslatableMarkup {
    // Intentionally transfer the string originally passed to t().
    // phpcs:ignore Drupal.Semantics.FunctionT.NotLiteralString
    return parent::t($string, $args, array_merge($options, ['context' => 'Library Agency Configuration']));
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('dpl_library_agency.general_settings');

    try {
      $branches = $this->branchRepository->getBranches();
      $branch_options = array_combine(
        array_map(function (Branch $branch) {
          return $branch->id;
        }, $branches),
        array_map(function (Branch $branch) {
          return $branch->title;
        }, $branches)
      );
      sort($branch_options);
    }
    catch (ApiException $api_exception) {
      $this->logger('dpl_library_agency')->error('Unable to retrieve agency branches: %message', ['%message' => $api_exception->getMessage()]);
      $this->messenger()->addError('Unable to retrieve branch information from FBS.');
      $branch_options = [];
    }

    $form['reservations'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservations'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['reservations']['reservation_sms_notifications_disabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable SMS notifications for reservations'),
      '#default_value' => $config->get('reservation_sms_notifications_disabled'),
      '#description' => $this->t('If checked, SMS notifications for patrons will be disabled.'),
    ];

    $form['branches'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Branches'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
      '#description' => $this->t('Select which branches should be available in different parts of the system.'),
    ];
    $form['branches']['search'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Search results'),
      '#options' => $branch_options,
      '#default_value' => [],
      '#description' => $this->t('Only works with holdings belonging to the selected branches will be shown in search results.'),
    ];
    $form['branches']['availability'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Availability'),
      '#options' => $branch_options,
      '#default_value' => [],
      '#description' => $this->t('Only holdings belonging to the selected branches will considered when showing work availability.'),
    ];
    $form['branches']['reservations'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Reservations'),
      '#options' => $branch_options,
      '#default_value' => [],
      '#description' => $this->t('Only selected branches will be available as pickup locations for reservations.'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_library_agency.general_settings')
      ->set('reservation_sms_notifications_disabled', $form_state->getValue('reservation_sms_notifications_disabled'))
      ->save();

    parent::submitForm($form, $form_state);
    $this->cacheTagsInvalidator->invalidateTags(ReservationSettings::getCacheTagsSmsNotificationsIsEnabled());
  }

}
