<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\CanonicalUrl\Link as CanonicalLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Body\Text;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;
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
    $nodeStorageProphecy->create([
      'type' => 'article',
      'uuid' => '982e0d87-f6b8-4b84-8de8-c8c8bcfef557',
    ])->willReturn($nodeProphecy);

    $paragraphStorageProphecy->create([
      'type' => 'text_body',
    ])->willReturn($paragraphProphecy);

    $this->container->set('entity_type.manager', $entityManagerProphecy->reveal());

    $graphqlNode = NodeArticle::make(
      '982e0d87-f6b8-4b84-8de8-c8c8bcfef557',
      'Bibliotekarerne anbefaler læsning til den mørke tid',
      '/anbefalinger-til-mork-tid',
      DateTime::make(1735689661, 'UTC'),
      'this is the subtitle',
      TRUE,
      'this is an author',
      'this is a teaser text',
      NULL,
      CanonicalLink::make('https://example.dk'),
      [
        ParagraphTextBody::make(
          '982e0d87-f6b8-4b84-8de8-c8c8bcfef999',
          Text::make('This is the text', 'with_format')
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

    $paragraphProphecy->set('field_body', [
      'value' => 'This is the text',
      'format' => 'with_format',
    ])->shouldHaveBeenCalled();
  }

}
