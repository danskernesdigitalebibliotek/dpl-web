<?php

declare(strict_types=1);

namespace Drupal\dpl_breadcrumb\Hook;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_breadcrumb\Services\BreadcrumbHelper;

/**
 * Token hooks for dpl_breadcrumb module.
 */
class TokenHooks {

  public function __construct(protected BreadcrumbHelper $helper) {}

  /**
   * Provides custom tokens used to build pretty breadcrumb URLs.
   *
   * @return array<mixed>
   *   An associative array of token information.
   */
  #[Hook('token_info')]
  public function provideBreadcrumbUrlAliasTokenInfo(): array {
    return [
      'types' => [
        'dpl_breadcrumb' => [
          'name' => 'DPL Breadcrumb',
        ],
      ],
      'tokens' => [
        'dpl_breadcrumb' => [
          'breadcrumb-url-alias' => [
            'name' => 'Breadcrumb URL alias',
          ],
        ],
      ],
    ];
  }

  /**
   * Provides the values for custom tokens.
   *
   * @param string $type
   *   The token type.
   * @param array<mixed> $tokens
   *   An array of tokens to be replaced.
   * @param array<mixed> $data
   *   An array of data objects.
   *
   * @return array<mixed>
   *   An associative array of replacement values.
   */
  #[Hook('tokens')]
  public function provideBreadcrumbUrlAliasTokenValue(string $type, array $tokens, array $data): array {
    $token_original = $tokens['breadcrumb-url-alias'] ?? NULL;

    if ($type !== 'dpl_breadcrumb' || empty($token_original)) {
      return [];
    }

    $entity = $data['node'] ?? NULL;

    if (empty($entity)) {
      $event_series = $data['eventseries'] ?? NULL;
      $event_instance = $data['eventinstance'] ?? NULL;

      $entity = $event_series ?? $event_instance;
    }

    if (!($entity instanceof FieldableEntityInterface)) {
      return [];
    }

    $token_value = $this->helper->getBreadcrumbUrlString($entity);
    // Pathauto 1.15.0 automatically adds a / prefix when patterns are saved.
    // Strip leading / from the url string to avoid duplication.
    $token_value = $token_value ? ltrim($token_value, '/') : NULL;

    return [
      $token_original => $token_value,
    ];
  }

}
