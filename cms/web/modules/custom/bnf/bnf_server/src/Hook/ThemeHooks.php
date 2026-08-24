<?php

declare(strict_types=1);

namespace Drupal\bnf_server\Hook;

use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_server\Controller\LoginController;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\AdminContext;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Theme hooks.
 */
class ThemeHooks {

  use StringTranslationTrait;

  public function __construct(
    protected SessionInterface $session,
    protected AdminContext $adminContext,
    protected RouteMatchInterface $routeMatch,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Our theme hooks.
   *
   * @phpstan-ignore missingType.iterableValue (return type is complex)
   */
  #[Hook('theme')]
  public function theme(): array {
    return [
      'bnf_server_import_link' => [
        'variables' => [
          'url' => NULL,
          'label' => NULL,
        ],
      ],
      'bnf_server_missing_callback' => [
        'variables' => [
          'node_uuid' => NULL,
        ],
      ],
      'bnf_server_logged_notifier' => [
        'variables' => [
          'url' => NULL,
          'name' => NULL,
        ],
      ],
    ];
  }

  /**
   * Add import button.
   *
   * Display the "import content to my site" button on content, if the user
   * has logged in and has the callback cookie context.
   *
   * @phpstan-ignore missingType.iterableValue (variables are complex data)
   */
  #[Hook('preprocess_page')]
  public function preprocessPage(array &$variables): void {
    $variables['#cache']['contexts'][] = 'bnf_library_session';

    $site_url = $this->session->get(LoginController::CALLBACK_URL_KEY);
    $site_name = $this->session->get(LoginController::SITE_NAME_KEY);
    $site_name = $site_name ?? $this->t('my site', [], ['context' => 'BNF']);

    if (!$site_url || $this->adminContext->isAdminRoute()) {
      return;
    }

    if ($site_name) {
      $variables['page']['content']['logged_notifier'] = [
        '#theme' => 'bnf_server_logged_notifier',
        '#name' => $site_name,
        '#url' => Url::fromRoute('view.importable_content.page'),
      ];
    }

    $route_name = $this->routeMatch->getRouteName();
    $node = $this->routeMatch->getParameter('node');
    $term = $this->routeMatch->getParameter('taxonomy_term');

    if ($route_name === 'entity.node.canonical' && ($node instanceof Node)) {
      $allowed_cts = BnfImporter::ALLOWED_CONTENT_TYPES;

      if (in_array($node->bundle(), $allowed_cts)) {
        $variables['page']['content']['import_link'] = [
          '#theme' => 'bnf_server_import_link',
          '#cache' => ['max-age' => 0],
          '#label' => $this->t(
            'Import "@content_title" to @site_name',
            ['@content_title' => $node->label(), '@site_name' => $site_name],
            ['context' => 'BNF']
          ),
          '#url' => Url::fromRoute(
            'bnf_server.import_redirect',
            ['uuid' => $node->uuid()]
          ),
        ];
      }
    }
    elseif ($route_name === 'entity.taxonomy_term.canonical' && ($term instanceof Term)) {
      $variables['page']['content']['import_link'] = [
        '#theme' => 'bnf_server_import_link',
        '#label' => $this->t(
          'Toggle subscription of "@content_title" on @site_name',
          ['@content_title' => $term->getName(), '@site_name' => $site_name],
          ['context' => 'BNF']
        ),
        '#url' => Url::fromRoute(
          'bnf_server.subscribe_redirect',
          ['uuid' => $term->uuid(), 'label' => $term->getName()],
        ),
      ];
    }
  }

}
