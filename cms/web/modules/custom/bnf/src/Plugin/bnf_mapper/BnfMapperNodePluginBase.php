<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoCategory;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoPage;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodePage;
use Drupal\bnf\Plugin\Traits\DateTimeTrait;
use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\node\NodeInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Base class for BNF mapper node plugins.
 */
abstract class BnfMapperNodePluginBase extends BnfMapperPluginBase {
  use ImageTrait;
  use DateTimeTrait;

  /**
   * Entity storage to create node in.
   */
  protected EntityStorageInterface $nodeStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected BnfMapperManager $manager,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileSystemInterface $fileSystem,
    protected FileRepositoryInterface $fileRepository,
    protected TranslationInterface $translation,
    #[Autowire(service: 'logger.channel.bnf')]
    protected LoggerInterface $logger,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->nodeStorage = $entityTypeManager->getStorage('node');
  }

  /**
   * Getting the existing node, or creating it from scratch.
   *
   * This also adds the fields to the node, that all node types uses - such
   * as title and status.
   */
  public function getNode(NodeArticle|NodePage|NodeGoArticle|NodeGoCategory|NodeGoPage $object, string $bundle): NodeInterface {
    /** @var \Drupal\node\Entity\Node[] $existing */
    $existing = $this->nodeStorage->loadByProperties(['uuid' => $object->id]);

    if ($existing) {
      $node = reset($existing);
    }
    else {
      /** @var \Drupal\node\Entity\Node $node */
      $node = $this->nodeStorage->create([
        'type' => $bundle,
        'uuid' => $object->id,
      ]);
    }

    $node->set('title', $object->title);
    $node->set('status', $object->status ? NodeInterface::PUBLISHED : NodeInterface::NOT_PUBLISHED);

    $node->set('field_paragraphs', $this->getParagraphs($object));
    $node->set('field_publication_date', $this->getDateTimeValue($object->publicationDate, FALSE));

    // Not all node types have canonicalUrls, but we're planning to add them
    // eventually.
    if (isset($object->canonicalUrl) && $node->hasField('field_canonical_url')) {
      $node->set('field_canonical_url', [
        'uri' => $object->canonicalUrl->url,
      ]);
    }

    if ($node->hasField('field_show_override_author')) {
      $node->set('field_show_override_author', TRUE);
    }

    if ($node->hasField('field_override_author')) {
      $author_fallback = $this->translation->translate('The library', [], ['context' => 'BNF']);

      $node->set('field_override_author', !empty($object->overrideAuthor) ?
        $object->overrideAuthor : (string) $author_fallback);
    }

    return $node;
  }

  /**
   * Runs paragraph mappers if they exist, and sets them on the node.
   *
   * @return mixed[]
   *   An array of paragrahs, processed by the respective mappers.
   *   NOTICE: Unsupported paragraphs are skipped.
   */
  private function getParagraphs(NodeArticle|NodePage|NodeGoArticle|NodeGoCategory|NodeGoPage $object): array {
    return $this->manager->mapAll($object->paragraphs ?? [], TRUE);
  }

}
