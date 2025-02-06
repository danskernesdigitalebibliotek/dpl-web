<?php

namespace Drupal\dpl_login\Plugin\OpenIDConnectClient;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\openid_connect\OpenIDConnectAutoDiscover;
use Drupal\openid_connect\OpenIDConnectStateTokenInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;
use GuzzleHttp\ClientInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Adgangsplatformen openid_connect plugin.
 *
 * @OpenIDConnectClient(
 *   id = "adgangsplatformen",
 *   label = @Translation("Adgangsplatformen")
 * )
 */
class Adgangsplatformen extends OpenIDConnectClientBase {

  public function __construct(
    array $configuration,
    string $plugin_id,
    $plugin_definition,
    RequestStack $request_stack,
    ClientInterface $http_client,
    LoggerChannelFactoryInterface $logger_factory,
    TimeInterface $datetime_time,
    KillSwitch $page_cache_kill_switch,
    LanguageManagerInterface $language_manager,
    OpenIDConnectStateTokenInterface $state_token,
    OpenIDConnectAutoDiscover $auto_discover,
    protected LibraryTokenHandler $libraryTokenHandler,
    MessengerInterface $messenger
  ) {
    parent::__construct(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $request_stack,
      $http_client,
      $logger_factory,
      $datetime_time,
      $page_cache_kill_switch,
      $language_manager,
      $state_token,
      $auto_discover,
    );
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition,
  ) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('request_stack'),
      $container->get('http_client'),
      $container->get('logger.factory'),
      $container->get('datetime.time'),
      $container->get('page_cache_kill_switch'),
      $container->get('language_manager'),
      $container->get('openid_connect.state_token'),
      $container->get('openid_connect.autodiscover'),
      $container->get(id: 'dpl_library_token.handler'),
      $container->get(id: 'messenger'),
    );
  }

  /**
   * {@inheritdoc}
   *
   * @return mixed[]
   *   Default configuration.
   */
  public function defaultConfiguration(): array {
    return [
      'authorization_endpoint' => 'https://login.bib.dk/oauth/authorize',
      'token_endpoint' => 'https://login.bib.dk/oauth/token/',
      'userinfo_endpoint' => 'https://login.bib.dk/userinfo/',
      'logout_endpoint' => 'https://login.bib.dk/logout',
      'agency_id' => NULL,
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   *
   * @param mixed[] $form
   *   Drupal form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Drupal form state.
   *
   * @return mixed[]
   *   Drupal form array.
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state): array {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['authorization_endpoint'] = [
      '#title' => $this->t('Authorization endpoint', [], ['context' => 'Dpl Login']),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['authorization_endpoint'],
    ];
    $form['token_endpoint'] = [
      '#title' => $this->t('Token endpoint', [], ['context' => 'Dpl Login']),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['token_endpoint'],
    ];
    $form['userinfo_endpoint'] = [
      '#title' => $this->t('UserInfo endpoint', [], ['context' => 'Dpl Login']),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['userinfo_endpoint'],
    ];
    $form['logout_endpoint'] = [
      '#title' => $this->t('Logout endpoint', [], ['context' => 'Dpl Login']),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['logout_endpoint'],
    ];
    $form['agency_id'] = [
      '#title' => $this->t('Agency ID', [], ['context' => 'Dpl Login']),
      '#type' => 'number',
      '#min' => 0,
      '#default_value' => $this->configuration['agency_id'],
    ];

    return $form;
  }

  /**
   * Check if the provided configuration can be used to fetch
   * the library token. If not, the form is invalid and should not
   * be submitted.
   *
   * @param mixed[] $form
   *   Drupal form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Drupal form state.
   *
   * @return void
   *   Drupal form array.
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state): void {
    parent::validateConfigurationForm($form, $form_state);

    if (!$this->libraryTokenHandler->fetchToken(
      $form_state->getValue('agency_id'),
      $form_state->getValue('client_id'),
      $form_state->getValue('client_secret'),
      $form_state->getValue('token_endpoint'),
    )) {
      $form_state->setError($form['client_id']);
      $form_state->setError($form['client_secret']);
      $form_state->setError($form['agency_id'], $this->t('Unable to retrieve token from Adgangsplatformen. Please check if the provided Client ID, Client Secret and Agency ID is correct.', [], ['context' => 'Dpl Login']));
    }
  }

  /**
   * Retrieve and store Library Token on form submit.
   *
   * @param mixed[] $form
   *   Drupal form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Drupal form state.
   *
   * @return void
   *   Drupal form array.
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state): void {
    parent::submitConfigurationForm($form, $form_state);

    $this->libraryTokenHandler->retrieveAndStoreToken(TRUE);
  }

  /**
   * {@inheritdoc}
   *
   * @return mixed[]
   *   Various endpoints.
   */
  public function getEndpoints(): array {
    return [
      'authorization' => $this->configuration['authorization_endpoint'],
      'token' => $this->configuration['token_endpoint'],
      'userinfo' => $this->configuration['userinfo_endpoint'],
    ];
  }

  /**
   * {@inheritdoc}
   *
   * @param string $scope
   *   Oauth2 scope.
   * @param \Drupal\Core\GeneratedUrl $redirect_uri
   *   The redirect uri.
   *
   * @return mixed[]
   *   Url options array.
   */
  protected function getUrlOptions($scope, GeneratedUrl $redirect_uri): array {
    $options = parent::getUrlOptions($scope, $redirect_uri);
    $options['query'] += ['agency' => $this->configuration['agency_id']];

    return $options;
  }

  /**
   * {@inheritdoc}
   *
   * Adgangsplatformen doesn't return an ID Token. The inherited method cannot
   * handle / decode the missing / null value so we hardcode the decoded value
   * to be an empty array.
   *
   * @return mixed[]
   *   Decoded id token.
   */
  public function decodeIdToken($id_token): array {
    return [];
  }

}
