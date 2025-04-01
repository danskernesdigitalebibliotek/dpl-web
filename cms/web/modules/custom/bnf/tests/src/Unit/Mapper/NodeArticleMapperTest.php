<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\CanonicalUrl\Link as CanonicalLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Changed\DateTime as ChangedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Created\DateTime as CreatedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Body\Text;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime as PublicationDateDateTime;
use Drupal\bnf\Plugin\bnf_mapper\NodeArticleMapper;
use Drupal\node\Entity\Node;

/**
 * Test the article node mapper.
 */
class NodeArticleMapperTest extends EntityMapperTestBase {

  /**
   * {@inheritdoc}
   */
  protected function getEntityName(): string {
    return 'node';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEntityClass(): string {
    return Node::class;
  }

  /**
   * Test article node mapping.
   */
  public function testNodeArticleMapping(): void {
    $this->storageProphecy->loadByProperties(['uuid' => '123'])->willReturn([]);
    $this->storageProphecy->create([
      'type' => 'article',
      'uuid' => '123',
    ])->willReturn($this->entityProphecy);

    $manager = $this->prophesize(BnfMapperManager::class);

    $mapper = new NodeArticleMapper(
      [],
      '',
      [],
      $manager->reveal(),
      $this->entityManagerProphecy->reveal(),
      $this->fileSystemProphecy->reveal(),
      $this->fileRepositoryProphecy->reveal(),
    );

    $graphqlArticle = NodeArticle::make(
      id: '123',
      title: 'this is the title',
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

    $node = $mapper->map($graphqlArticle);

    $this->assertSame($node, $this->entityProphecy->reveal());
    $this->entityProphecy->set('title', 'this is the title')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_subtitle', 'this is the subtitle')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_override_author', 'this is an author')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_show_override_author', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_publication_date', ["value" => "2025-01-01"])->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_teaser_text', 'this is a teaser text')->shouldHaveBeenCalled();
  }

}
