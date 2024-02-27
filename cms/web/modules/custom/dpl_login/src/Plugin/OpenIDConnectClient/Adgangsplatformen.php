<?php

namespace Drupal\dpl_login\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\GeneratedUrl;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;

/**
 * Adgangsplatformen openid_connect plugin.
 *
 * @OpenIDConnectClient(
 *   id = "adgangsplatformen",
 *   label = @Translation("Adgangsplatformen")
 * )
 */
class Adgangsplatformen extends OpenIDConnectClientBase {

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
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
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
