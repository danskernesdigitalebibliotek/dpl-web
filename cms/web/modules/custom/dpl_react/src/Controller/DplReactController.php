<?php

namespace Drupal\dpl_react\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\dpl_login\UserTokensProvider;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use function Safe\sprintf;

/**
 * DDB React Controller.
 */
class DplReactController extends ControllerBase {

  /**
   * The Library token handler.
   *
   * @var \Drupal\dpl_library_token\LibraryTokenHandler
   */
  protected LibraryTokenHandler $libraryTokenHandler;
  /**
   * The User token provider.
   *
   * @var \Drupal\dpl_login\UserTokensProvider
   */
  protected userTokensProvider $userTokensProvider;

  /**
   * DdplReactController constructor.
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
   * @return \Symfony\Component\HttpFoundation\Response
   *   Set tokens for the ddb react js application.
   */
  public function user() {
    $content_lines = ['window.dplReact = window.dplReact || {};'];

    if ($token_agency = $this->libraryTokenHandler->getToken()) {
      $content_lines[] = sprintf('window.dplReact.setToken("library", "%s")', $token_agency);
    }

    if ($access_token = $this->userTokensProvider->getAccessToken()) {
      if ($token_user = $access_token->token ?? FALSE) {
        $content_lines[] = sprintf('window.dplReact.setToken("user", "%s")', $token_user);
      }
    }

    $content = implode("\n", $content_lines);
    $response = new Response();
    $response->setContent($content);
    $response->headers->set('Content-Type', 'application/javascript');
    return $response;
  }

}
