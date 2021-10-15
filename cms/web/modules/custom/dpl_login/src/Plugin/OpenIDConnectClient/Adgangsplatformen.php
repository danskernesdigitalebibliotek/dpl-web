<?php

namespace Drupal\dpl_login\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;
use Drupal\Core\GeneratedUrl;

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
   */
  public function defaultConfiguration() {
    return [
      'authorization_endpoint' => 'https://login.bib.dk/oauth/authorize',
      'token_endpoint' => 'https://login.bib.dk/oauth/token/',
      'userinfo_endpoint' => 'https://login.bib.dk/userinfo/',
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['authorization_endpoint'] = [
      '#title' => $this->t('Authorization endpoint'),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['authorization_endpoint'],
    ];
    $form['token_endpoint'] = [
      '#title' => $this->t('Token endpoint'),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['token_endpoint'],
    ];
    $form['userinfo_endpoint'] = [
      '#title' => $this->t('UserInfo endpoint'),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['userinfo_endpoint'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getEndpoints() {
    return [
      'authorization' => $this->configuration['authorization_endpoint'],
      'token' => $this->configuration['token_endpoint'],
      'userinfo' => $this->configuration['userinfo_endpoint'],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function getUrlOptions($scope, GeneratedUrl $redirect_uri) {
    $options = parent::getUrlOptions($scope, $redirect_uri);

    return [
      'query' => [
        // TODO: Should not be hardcoded.
        // We find another way. Probably through a config variable.
        'agency' => '710100',
      ] + $options['query'],
    ] + $options;
  }

  /**
   * {@inheritdoc}
   *
   * Adgangsplatformen doesn't return an ID Token. The inherited method cannot
   * handle / decode the missing / null value so we hardcode the decoded value
   * to be an empty array.
   */
  public function decodeIdToken($id_token) {
    return [];
  }

}
