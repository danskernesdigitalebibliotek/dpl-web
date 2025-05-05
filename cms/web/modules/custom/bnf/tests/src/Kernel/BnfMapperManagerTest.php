<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel;

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
    $nodeProphecy->set('field_paragraphs', [$paragraphProphecy->reveal()])->shouldHaveBeenCalled();

    $paragraphProphecy->set('field_body', [
      'value' => 'This is the text',
      'format' => 'with_format',
    ])->shouldHaveBeenCalled();

  }

}
