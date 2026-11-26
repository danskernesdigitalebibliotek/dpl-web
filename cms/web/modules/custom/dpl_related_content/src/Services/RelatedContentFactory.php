<?php

declare(strict_types=1);

namespace Drupal\dpl_related_content\Services;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;

/**
 * Creates RelatedContent instances.
 *
 * RelatedContent is configured by setting properties on it, so each list
 * needs its own instance.
 */
class RelatedContentFactory {

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected Connection $connection,
    protected TranslationInterface $translation,
  ) {}

  /**
   * Create a new RelatedContent instance.
   */
  public function create(): RelatedContent {
    return new RelatedContent($this->entityTypeManager, $this->connection, $this->translation);
  }

}
