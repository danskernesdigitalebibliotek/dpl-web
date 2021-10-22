<?php

namespace Drupal\ddb_react\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;
use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\dpl_login\UserTokensProvider;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * DDB React Controller.
 */
class DddbReactController extends ControllerBase {

  /**
   * The Library token handler.
   *
   * @var \Drupal\dpl_library_token\LibraryTokenHandler
   */
  protected LibraryTokenHandler $libraryTokenHandler;
  /**
   * The Uuser token provider.
   *
   * @var \Drupal\dpl_login\UserTokensProvider
   */
  protected userTokensProvider $userTokensProvider;

  /**
   * DddbReactController constructor.
   *
   * @param \Drupal\dpl_library_token\LibraryTokenHandler $library_token_handler
   *   The Library token handler.
   * @param \Drupal\dpl_login\UserTokensProvider $user_token_provider
   *   The Uuser token provider.
   */
  public function __construct(
    LibraryTokenHandler $library_token_handler,
    UserTokensProvider $user_token_provider
    ) {
    $this->libraryTokenHandler = $library_token_handler;
    $this->userTokensProvider = $user_token_provider;
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
      $container->get('dpl_library_token.handler'),
      $container->get('dpl_login.user_tokens'),
    );
  }

  /**
   * Render user.js javascript.
   *
   * @return array|\Symfony\Component\HttpFoundation\Response
   *   If something goes wrong empty render array otherwise js.
   */
  public function user() {
    if (!$acces_token = $this->userTokensProvider->getAccessToken()) {
      return [];
    }
    if (!$token_user = $acces_token->token ?? FALSE) {
      return [];
    }
    if (!$token_agency = $this->libraryTokenHandler->getToken()) {
      return [];
    }

    $content = <<<EOD
window.ddbReact = window.ddbReact || {};
window.ddbReact.setToken('user', '$token_user');
window.ddbReact.setToken('library', '$token_agency');
EOD;

    $response = new Response();
    $response->setContent($content);
    $response->headers->set('Content-Type', 'application/javascript');
    return $response;
  }

}
