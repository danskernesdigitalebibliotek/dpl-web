<?php

namespace Drupal\dpl_patron_reg\Controller;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\OpenIDConnectSession;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_login\UserTokensProvider;
use Symfony\Component\HttpFoundation\Request;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;

/**
 * Patron registration Controller.
 */
class DplPatronRegController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected UserTokensProvider $user_token_provider,
    protected OpenIDConnectSession $session,
    protected OpenIDConnectClientManager $pluginManager,
    protected OpenIDConnectClaims $claims
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): DplPatronRegController|static {
    return new static(
      $container->get('dpl_login.user_tokens'),
      $container->get('openid_connect.session'),
      $container->get('plugin.manager.openid_connect_client'),
      $container->get('openid_connect.claims'),
    );
  }

  /**
   * Build and return information page as page.
   *
   * @return array<string,array>
   *   The page as a render array.
   */
  public function informationPage(): array {
    $config = $this->config('dpl_patron_reg.settings');
    $logins = [];

    // Loop over all open id connect definitions and build login links for each
    // one.
    $definitions = $this->pluginManager->getDefinitions();
    foreach ($definitions as $client_id => $client) {
      if (!$this->config('openid_connect.settings.' . $client_id)
        ->get('enabled')) {
        continue;
      }

      $url = Url::fromRoute('dpl_patron_reg.auth', ['client_name' => $client_id], ['absolute' => TRUE]);
      $link = Link::fromTextAndUrl($this->t('Log in with @client_title', [
        '@client_title' => $client['label'],
      ]), $url);
      $logins[$client_id] = $link->toRenderable();
    }

    return [
      'info' => [
        '#type' => 'processed_text',
        '#text' => $config->get('information')['value'] ?? 'Please fill out the information page in the administration',
        '#format' => $config->get('information')['format'] ?? 'plain_text',
      ],
      'logins' => $logins,
    ];
  }

  /**
   * Redirect callback that redirects to log in service.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Http request object.
   * @param string $client_name
   *   OpenID connect client name.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse
   *   Redirect response based on given client configuration.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function authRedirect(Request $request, string $client_name): TrustedRedirectResponse {
    $this->session->saveDestination();

    $configuration = $this->config('openid_connect.settings.' . $client_name)
      ->get('settings');
    /** @var \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client */
    $client = $this->pluginManager->createInstance(
      $client_name,
      $configuration
    );
    $scopes = $this->claims->getScopes($client);
    $_SESSION['openid_connect_op'] = 'login';

    /** @var \Drupal\Core\Routing\TrustedRedirectResponse $response */
    $response = $client->authorize($scopes);

    // Get redirect URL from OpenID connect and add forced nem-login idp into
    // the URL.
    $url = UrlHelper::parse($response->getTargetUrl());
    $url['query']['idp'] = 'nemlogin';
    $url = Url::fromUri($url['path'], ['query' => $url['query']]);
    $url->setAbsolute();

    // Set redirect Url after login. If you use the $request->getSession()
    // object this trick simply do not work and the redirect after login is
    // ignored.
    $_SESSION['openid_connect_destination'] = Url::fromRoute('dpl_patron_reg.create')->toString(TRUE)->getGeneratedUrl();

    return new TrustedRedirectResponse($url->toString());
  }

  /**
   * Load the user registration create user react application.
   *
   * @return array[]
   */
  public function userRegistrationReactAppLoad(): array {
    $config = $this->config('dpl_patron_reg.settings');
    $userToken = $this->user_token_provider->getAccessToken()?->token;
    // Todo, this does not exist, it is in another pr, perhaps a seperate pr or we wait?
    $patron_page_settings = $this->configFactory->get('patron_page.settings');

    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'create-patron',
      '#data' => [
        'pickup-branches-dropdown-label-text' => $this->t("Choose pickup branch", [], $context),
        'blacklisted-pickup-branches-config' => DplReactAppsController::buildBranchesListProp($this->branchSettings->getExcludedReservationBranches()),
        'branches-config' => DplReactAppsController::buildBranchesJsonProp($this->branchRepository->getBranches()),
        // 'pincode-length-min-config' => $patron_page_settings->get('pincode_length_min'),
        // 'pincode-length-max-config' => $patron_page_settings->get('pincode_length_max'),
        // todo connected to todo in l135
        'pincode-length-min-config' => '4',
        'pincode-length-max-config' => '4',
        'patron-page-change-pincode-header-text' => $this->t("Pincode", [], $context),
        'pickup-branches-dropdown-nothing-selected-text' => $this->t("Nothing selected", [], $context),
        'patron-page-change-pincode-body-text' => $this->t("Change current pin by entering a new pin and saving", [], $context),
        'patron-page-pincode-label-text' => $this->t("New pin", [], $context),
        'patron-page-confirm-pincode-label-text' => $this->t("Confirm new pin", [], $context),
        'patron-contact-name-label-text' => $this->t("Name", [], $context),
        'patron-page-pincode-too-short-validation-text' => $this->t("The pincode should be minimum @pincodeLengthMin and maximum @pincodeLengthMax characters long", [], $context),
        'patron-page-pincodes-not-the-same-text' => $this->t("The pincodes are not the same", [], $context),
        'patron-contact-phone-label-text' => $this->t("Phone number", [], $context),
        'patron-contact-info-body-text' => $this->t("", [], $context),
        'patron-contact-info-header-text' => $this->t("", [], $context),
        'patron-contact-phone-checkbox-text' => $this->t("Receive text messages about your loans, reservations, and so forth", [], $context),
        'patron-contact-email-label-text' => $this->t("E-mail", [], $context),
        'patron-contact-email-checkbox-text' => $this->t("Receive emails about your loans, reservations, and so forth", [], $context),
        'create-patron-change-pickup-header-text' => $this->t("", [], $context),
        'create-patron-change-pickup-body-text' => $this->t("", [], $context),
        'create-patron-header-text' => $this->t("Register as patron", [], $context),
        'create-patron-invalid-ssn-header-text' => $this->t("Invalid SSN", [], $context),
        'create-patron-invalid-ssn-body-text' => $this->t("This SSN is invalid", [], $context),
        'create-patron-confirm-button-text' => $this->t("Confirm", [], $context),
        'create-patron-cancel-button-text' => $this->t("Cancel", [], $context),
        'min-age-config' => $config['age_limit'] ?? '18',
        'redirect-on-user-created-url' => $config['redirect_on_user_created_url'],
        'user-token' => $userToken,
      ]+ DplReactAppsController::externalApiBaseUrls(),
    ];
  }

}
