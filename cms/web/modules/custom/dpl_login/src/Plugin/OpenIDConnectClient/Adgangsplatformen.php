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
      'agency_id' => NULL,
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
    $form['agency_id'] = [
      '#title' => $this->t('Agency ID'),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['agency_id'],
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
        'agency' => $this->configuration['agency_id'],
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
