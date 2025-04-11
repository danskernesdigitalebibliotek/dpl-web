<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\CanonicalUrl\Link as CanonicalLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Changed\DateTime as ChangedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Created\DateTime as CreatedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Body\Text;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime as PublicationDateDateTime;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Test BnfMapperManager.
 */
class BnfMapperManagerTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'bnf',
    'node',
    'user',
    // Needed for the bnf_state base field.
    'options',
    'file',
  ];

  /**
   * Test that the mapper will properly map a response with sub-mappings.
   */
  public function testBnfArticleMapper(): void {
    $manager = $this->container->get('plugin.manager.bnf_mapper');

    $entityManagerProphecy = $this->prophesize(EntityTypeManagerInterface::class);
    $nodeStorageProphecy = $this->prophesize(EntityStorageInterface::class);
    $paragraphStorageProphecy = $this->prophesize(EntityStorageInterface::class);
    $nodeProphecy = $this->prophesize(Node::class);
    $paragraphProphecy = $this->prophesize(Paragraph::class);

    $entityManagerProphecy->getStorage('node')->willReturn($nodeStorageProphecy);
    $entityManagerProphecy->getStorage('paragraph')->willReturn($paragraphStorageProphecy);

    $nodeStorageProphecy->loadByProperties([
      'uuid' => '982e0d87-f6b8-4b84-8de8-c8c8bcfef557',
    ])->willReturn([$nodeProphecy]);

    $nodeStorageProphecy->create([
      'type' => 'article',
      'uuid' => '982e0d87-f6b8-4b84-8de8-c8c8bcfef557',
    ])->willReturn($nodeProphecy);

    $nodeProphecy->hasField('field_canonical_url')->willReturn(TRUE);

    $paragraphStorageProphecy->create([
      'type' => 'text_body',
    ])->willReturn($paragraphProphecy);

    $this->container->set('entity_type.manager', $entityManagerProphecy->reveal());

    $graphqlNode = NodeArticle::make(
      id: '982e0d87-f6b8-4b84-8de8-c8c8bcfef557',
      title: 'Bibliotekarerne anbefaler læsning til den mørke tid',
      url: '/anbefalinger-til-mork-tid',
      status: TRUE,
      changed: ChangedDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      created: CreatedDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      publicationDate: PublicationDateDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      canonicalUrl: CanonicalLink::make(
        url: 'https://example.dk'
      ),
      overrideAuthor: 'this is an author',
      showOverrideAuthor: TRUE,
      subtitle: 'this is the subtitle',
      teaserImage: NULL,
      teaserText: 'this is a teaser text',
      paragraphs: [
        ParagraphTextBody::make(
          id: '982e0d87-f6b8-4b84-8de8-c8c8bcfef999',
          body: Text::make(
            format: 'with_format', value: 'This is the text')
        ),
      ]
    );

    $mapper = $manager->getMapper($graphqlNode);
    $node = $mapper->map($graphqlNode);

    $this->assertSame($node, $nodeProphecy->reveal());
    $nodeProphecy->set('title', 'Bibliotekarerne anbefaler læsning til den mørke tid')->shouldHaveBeenCalled();
    $nodeProphecy->set('field_canonical_url', [
      'uri' => 'https://example.dk',
    ])->shouldHaveBeenCalled();
    $nodeProphecy->set('field_paragraphs', [$paragraphProphecy->reveal()])->shouldHaveBeenCalled();
    $nodeProphecy->set('status', NodeInterface::PUBLISHED)->shouldHaveBeenCalled();
    $nodeProphecy->set('field_publication_date', ["value" => "2025-01-01"])->shouldHaveBeenCalled();
    $nodeProphecy->set('field_subtitle', 'this is the subtitle')->shouldHaveBeenCalled();
    $nodeProphecy->set('field_override_author', 'this is an author')->shouldHaveBeenCalled();
    $nodeProphecy->set('field_show_override_author', TRUE)->shouldHaveBeenCalled();
    $nodeProphecy->set('field_teaser_text', 'this is a teaser text')->shouldHaveBeenCalled();
    $nodeProphecy->set('field_teaser_image', [])->shouldHaveBeenCalled();

    $paragraphProphecy->set('field_body', [
      'value' => 'This is the text',
      'format' => 'with_format',
    ])->shouldHaveBeenCalled();
  }

}
