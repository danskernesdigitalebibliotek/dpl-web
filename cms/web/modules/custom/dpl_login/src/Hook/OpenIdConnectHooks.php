<?php

declare(strict_types=1);

namespace Drupal\dpl_login\Hook;

use DanskernesDigitaleBibliotek\FBS\ApiException;
use DanskernesDigitaleBibliotek\FBS\Model\AuthenticatedPatronV8;
use DanskernesDigitaleBibliotek\FBS\Model\BlockStatus;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;
use Drupal\dpl_fbs\FbsApiFactory;
use Drupal\dpl_fbs\Patron\BlockedReason;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\AuthenticationType;
use Drupal\dpl_login\DplLoginInterface;
use Drupal\dpl_login\DplLoginSession;
use Drupal\dpl_login\Exception\AccessTokenCreationException;
use Drupal\dpl_login\OpenIdUserInfoService;
use Drupal\dpl_login\RegisteredUserTokensProvider;
use Drupal\dpl_login\Unilogin;
use Drupal\dpl_login\UniloginUserTokensProvider;
use Drupal\dpl_login\UnregisteredUserTokensProvider;
use Drupal\dpl_login\UserTokensProviderInterface;
use Drupal\openid_connect\OpenIDConnectSessionInterface;
use Drupal\user\UserInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * OpenID Connect hooks for logging in with Adgangsplatformen.
 */
class OpenIdConnectHooks {

  use StringTranslationTrait;

  public function __construct(
    protected OpenIdUserInfoService $openIdUserInfo,
    protected Config $adgangsplatformenConfig,
    protected DplLoginSession $dplLoginSession,
    protected OpenIDConnectSessionInterface $openIdSession,
    #[Autowire(service: 'dpl_fbs.api_factory')]
    protected FbsApiFactory $fbsApiFactory,
    protected RegisteredUserTokensProvider $registeredUserTokens,
    protected UnregisteredUserTokensProvider $unregisteredUserTokens,
    protected UniloginUserTokensProvider $uniloginUserTokens,
    protected LoggerChannelFactoryInterface $loggerFactory,
    protected MessengerInterface $messenger,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add user info from the Adgangsplatformen user info response.
   *
   * @param mixed[] $userinfo
   *   User info from external service.
   * @param mixed[] $context
   *   Various openid_connect context. Tokens etc.
   *
   * @throws \Exception
   */
  #[Hook('openid_connect_userinfo_alter')]
  public function addAdgangsplatformenUserInfo(array &$userinfo, array $context): void {
    if ($context['plugin_id'] !== DplLoginInterface::PLUGIN_ID_ADGANGSPLATFORMEN) {
      return;
    }

    $userinfo = array_merge(
      $userinfo,
      $this->openIdUserInfo->getOpenIdUserInfoFromAdgangsplatformenUserInfoResponse($userinfo)
    );
  }

  /**
   * Deny login for blocked patrons and Unilogin users not at this library.
   *
   * @param \Drupal\Core\Session\AccountInterface|false $account
   *   User account.
   * @param mixed[] $context
   *   Various openid_connect context. Tokens etc.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  #[Hook('openid_connect_pre_authorize')]
  public function denyBlockedUsers(AccountInterface|FALSE $account, array $context): bool {
    if ($context['plugin_id'] !== DplLoginInterface::PLUGIN_ID_ADGANGSPLATFORMEN) {
      return TRUE;
    }

    $logger = $this->getAuthorizationLogger();

    try {
      $token = AccessToken::createFromOpenidConnectContext($context);
    }
    catch (AccessTokenCreationException $e) {
      $logger->error('Authorization blocked. Unable to create access token: @message', [
        '@message' => $e->getMessage(),
      ]);
      return FALSE;
    }

    // Unilogin users are not patrons, so they are authorized without FBS.
    if ($this->isUniloginLogin($context)) {
      return $this->isUniloginUserAuthorized($context, $logger);
    }

    // Check if the user is previously associated with an agency (library).
    // If not, we assume the user is new and skip the patron blocked check.
    if (!$this->isUserAssociatedWithAgency($context)) {
      return TRUE;
    }

    try {
      $patron = $this->getPatron($token);
      $patron_block_status = $patron->getPatron()?->getBlockStatus() ?? [];
      $patron_blocked_reasons = array_map(function (BlockStatus $block_status) use ($logger) {
        try {
          return BlockedReason::from($block_status->getBlockedReason());
        }
        catch (\UnexpectedValueException $e) {
          $logger->warning('Unable to map blocked reason @reason: @message', [
            '@reason' => $block_status->getBlockedReason(),
            '@message' => $e->getMessage(),
          ]);
          return BlockedReason::UNKNOWN();
        }
      }, $patron_block_status);

      // Only a subset of the blocked reasons should block login.
      $deny_login_reasons = [
        BlockedReason::DECEASED(),
        BlockedReason::ACCOUNT_STOLEN(),
        BlockedReason::BLOCKED_FROM_SELFSERVICE(),
      ];
      $patron_deny_reasons = array_intersect($patron_blocked_reasons, $deny_login_reasons);

      // Return FALSE to block login if the patron block reasons match one or
      // more of the deny reasons. The OpenID Connect module will provide
      // feedback.
      return !(count($patron_deny_reasons) > 0);
    }
    catch (ApiException $e) {
      $logger->error('Authorization blocked. Unable to get patron information: @message', [
        '@message' => $e->getMessage(),
      ]);
      return FALSE;
    }
  }

  /**
   * Store the access token of the user that logged in.
   *
   * Users that are not registered at this library are sent to the front page
   * with a message telling them to sign up.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   User account.
   * @param mixed[] $context
   *   Various openid_connect context. Tokens etc.
   */
  #[Hook('openid_connect_post_authorize')]
  public function storeAccessToken(AccountInterface $account, array $context): void {
    if ($context['plugin_id'] !== DplLoginInterface::PLUGIN_ID_ADGANGSPLATFORMEN) {
      return;
    }
    $access_token = AccessToken::createFromOpenidConnectContext($context);
    $authentication_type = $this->dplLoginSession->getAuthenticationType();

    // Unilogin users are not patrons. Store their token with its own type,
    // which is never handed to the React apps, and skip the FBS lookups and
    // the registration flow for patrons.
    $is_unilogin = $this->isUniloginLogin($context);
    if ($is_unilogin) {
      $access_token->uniId = Unilogin::getUniId($context['userinfo'] ?? []);
      $token_provider = $this->uniloginUserTokens;
      $logger = $this->getAuthorizationLogger();
    }
    else {
      $token_provider = $this->getAccessTokenProvider($access_token);
      $logger = $this->getAuthorizationLogger($access_token);
    }

    if ($this->deletePreviousUserTokens()) {
      $token_provider->setAccessToken($access_token);
    }
    else {
      $logger->error('Post authorize hook - Unable to delete previous user tokens.');
    }

    // The user managed to login but is not registered at this library
    // make sure that the user is redirected to the front page.
    if (!$is_unilogin && $authentication_type === AuthenticationType::Login && !$this->userIsRegistered($access_token)) {
      $url = Url::fromRoute('<front>')->toString(TRUE);
      $this->openIdSession->saveTargetLinkUri($url->getGeneratedUrl());
      // And show a message to the unregistered user.
      $this->messenger->addError($this->t(
        'You are not registered at this library.<br />Please <a href=":sign_up">sign up</a> at this library or <a href=":log_out">log out</a> again.',
        [
          ':sign_up' => Url::fromRoute('dpl_patron_reg.create')->toString(),
          ':log_out' => Url::fromRoute('dpl_login.logout')->toString(),
        ],
        ['context' => 'dpl_login']
      ));
    }

    // Tidy up to not leave stale authentication type in session.
    $this->dplLoginSession->deletetAuthenticationType();
    $this->dplLoginSession->deleteUniloginLogin();
  }

  /**
   * Give new users the patron or Unilogin patron role.
   *
   * @param \Drupal\user\UserInterface $account
   *   The user account being saved.
   * @param mixed[] $context
   *   Various openid_connect context. Tokens etc.
   */
  #[Hook('openid_connect_userinfo_save')]
  public function addRoleToNewUser(UserInterface $account, array $context): void {
    if ($context['plugin_id'] !== DplLoginInterface::PLUGIN_ID_ADGANGSPLATFORMEN) {
      return;
    }

    // If the user is new we attach a role to the user.
    if (!$this->userHasBeenProcessed($context)) {
      $account->addRole($this->isUniloginLogin($context)
        ? DplLoginInterface::ROLE_UNILOGIN_PATRON
        : DplLoginInterface::ROLE_PATRON);
      $account->save();
    }
  }

  /**
   * Get patron information from FBS.
   */
  protected function getPatron(AccessToken $token): AuthenticatedPatronV8 {
    $api = $this->fbsApiFactory->getPatronApi($token->token);
    return $api->getPatronInformationByPatronIdV4();
  }

  /**
   * Is this a login with Unilogin?
   *
   * Decided by the Unilogin claims in the userinfo, so a Unilogin identity
   * coming back from a plain login (Adgangsplatformen single sign-on) is
   * recognised too. The flag set by a Unilogin login is a fallback.
   *
   * @param mixed[] $context
   *   Various openid_connect context.
   */
  protected function isUniloginLogin(array $context): bool {
    if (Unilogin::isUniloginUser($context['userinfo'] ?? [])) {
      return TRUE;
    }

    return $this->dplLoginSession->isUniloginLogin();
  }

  /**
   * May the Unilogin user log in at this library?
   *
   * @param mixed[] $context
   *   Various openid_connect context.
   * @param \Psr\Log\LoggerInterface $logger
   *   Logger for denied logins.
   */
  protected function isUniloginUserAuthorized(array $context, LoggerInterface $logger): bool {
    $agency_id = (string) $this->adgangsplatformenConfig->getAgencyId();
    $userinfo = $context['userinfo'] ?? [];

    $reason = Unilogin::getDenialReason($userinfo, $agency_id);
    if (!$reason) {
      return TRUE;
    }

    // The login ends here, so do not leave the flag for the next one.
    $this->dplLoginSession->deleteUniloginLogin();

    $logger->warning('Authorization blocked. Unilogin user denied: @reason. User type: @user_type, institutions: @institutions, agency: @agency, expected agency: @expected', [
      '@reason' => $reason,
      '@user_type' => $userinfo['attributes']['uniloginUserType'] ?? 'none',
      '@institutions' => implode(', ', Unilogin::getInstitutionIds($userinfo)) ?: 'none',
      '@agency' => $userinfo['attributes'][Unilogin::CLAIM_AGENCY_ID] ?? 'none',
      '@expected' => $agency_id,
    ]);
    return FALSE;
  }

  /**
   * Check if the agency id is already associated with the user.
   *
   * @param mixed[] $context
   *   Various openid_connect context.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  protected function isUserAssociatedWithAgency(array $context): bool {
    $agency_id = $this->adgangsplatformenConfig->getAgencyId();

    if (empty($context['userinfo']['attributes']['agencies'])) {
      return FALSE;
    }

    // Checks if the Agency ID is already associated with the user.
    // This is done by checking if the user has an Agency ID that matches
    // the current Agency ID and has the userIdType set as LOCAL.
    $agency_list = $context['userinfo']['attributes']['agencies'];
    $result = array_filter($agency_list, function ($agency) use ($agency_id) {
      return $agency['agencyId'] === $agency_id && $agency['userIdType'] === 'LOCAL';
    });

    return !empty($result);
  }

  /**
   * Is the user registered in FBS?
   *
   * @todo Should be a part of the UserTokens service.
   */
  protected function userIsRegistered(AccessToken $token): bool {
    try {
      $patron = $this->getPatron($token);
    }
    // @todo We expect that an API Exception means that the user is not
    // registered. However this is not a safe assumption, so we have flagged
    // this as TODO for later inspection.
    catch (ApiException $e) {
      $this->loggerFactory->get('dpl_login')->error('Authorization blocked. Unable to create access token: @message', [
        '@message' => $e->getMessage(),
      ]);
      return FALSE;
    }

    return $patron->getAuthenticateStatus() === 'VALID';
  }

  /**
   * Get the logger for the authorization.
   *
   * @todo Should be a part of the UserTokens service.
   */
  protected function getAuthorizationLogger(?AccessToken $token = NULL): LoggerInterface {
    // If the user is not registered we use a key that tells us
    // that we are in a registering flow.
    if ($token && !$this->userIsRegistered($token)) {
      return $this->loggerFactory->get(DplLoginInterface::LOGGER_KEY_UNREGISTERED_USER);
    }

    return $this->loggerFactory->get(DplLoginInterface::LOGGER_KEY);
  }

  /**
   * Get the token provider matching whether the user is registered.
   *
   * @todo Should be a part of the UserTokens service.
   */
  protected function getAccessTokenProvider(AccessToken $token): UserTokensProviderInterface {
    if (!$this->userIsRegistered($token)) {
      return $this->unregisteredUserTokens;
    }

    return $this->registeredUserTokens;
  }

  /**
   * Delete all previous user tokens.
   *
   * @todo Should be a part of the UserTokens service.
   */
  protected function deletePreviousUserTokens(): bool {
    $statuses = [];
    foreach ([$this->registeredUserTokens, $this->unregisteredUserTokens, $this->uniloginUserTokens] as $user_tokens_provider) {
      $statuses[] = $user_tokens_provider->deleteAccessToken();
    }

    return (bool) array_filter($statuses);
  }

  /**
   * Decide if the user has already been processed.
   *
   * @param mixed[] $openid_connect_context
   *   Various openid_connect context. Tokens etc.
   */
  protected function userHasBeenProcessed(array $openid_connect_context): bool {
    // If we for some reason do not have the information
    // about the user.
    // Or if we are sure that the user is an already created user
    // then we do not attach any information.
    return (isset($openid_connect_context['is_new'])) ? !$openid_connect_context['is_new'] : FALSE;
  }

}
