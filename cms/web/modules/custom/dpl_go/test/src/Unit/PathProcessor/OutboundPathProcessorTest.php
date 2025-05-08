<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit\PathProcessor;

use Drupal\Core\Entity\EntityBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Routing\AdminContext;
use Drupal\dpl_go\GoSite;
use Drupal\dpl_go\PathProcessor\OutboundPathProcessor;
use Drupal\Tests\UnitTestCase;
use Prophecy\Prophecy\ObjectProphecy;
use Symfony\Component\HttpFoundation\Request;

/**
 * Test the URL rewriting.
 */
class OutboundPathProcessorTest extends UnitTestCase {

  /**
   * GoSite mock.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\dpl_go\GoSite>
   */
  protected ObjectProphecy $goSite;

  /**
   * Node storage mock.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $nodeStorage;

  /**
   * AdminContext mock.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Routing\AdminContext>
   */
  protected ObjectProphecy $adminContext;

  /**
   * The subject under test.
   */
  protected OutboundPathProcessor $pathProcessor;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $typeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $typeManager->getStorage('node')->willReturn($this->nodeStorage);

    $this->goSite = $this->prophesize(GoSite::class);
    $this->goSite->getGoBaseUrl();

    $this->adminContext = $this->prophesize(AdminContext::class);
    $this->adminContext->isAdminRoute()->willReturn(FALSE);

    $this->pathProcessor = new OutboundPathProcessor(
      $this->goSite->reveal(),
      $typeManager->reveal(),
      $this->adminContext->reveal(),
    );
  }

  /**
   * Test that non-node paths are passed through unmolested.
   */
  public function testNonNodesArePassedThrough(): void {
    $options = [];
    $newPath = $this->pathProcessor->processOutbound(
      '/admin',
      $options,
      new Request(),
      new BubbleableMetadata(),
    );

    $this->assertEquals('/admin', $newPath);
    $this->assertArrayNotHasKey('base_url', $options);
  }

  /**
   * Test node URL rewriting.
   *
   * @dataProvider nodeCases
   */
  public function testNodeUrlRewriting(
    string $nid,
    bool $isGoNode,
    bool $isGo,
    ?string $expectedBaseUrl,
  ): void {
    $node = $this->prophesize(EntityBase::class);
    $this->nodeStorage->load($nid)->willReturn($node);
    $this->goSite->isGoSite()->willReturn($isGo);
    $this->goSite->isGoNode($node)->willReturn($isGoNode);
    $this->goSite->getCmsBaseUrl()->willReturn('https://cms.site');
    $this->goSite->getGoBaseUrl()->willReturn('https://go.cms.site');

    $options = [];
    $newPath = $this->pathProcessor->processOutbound(
      "/node/{$nid}",
      $options,
      new Request(),
      new BubbleableMetadata(),
    );

    $this->assertEquals("/node/{$nid}", $newPath);
    if ($expectedBaseUrl) {
      $this->assertArrayHasKey('base_url', $options);
      $this->assertEquals($expectedBaseUrl, $options['base_url']);
    }
    else {
      $this->assertArrayNotHasKey('base_url', $options);
    }
  }

  /**
   * Test cases for testNodeUrlRewriting.
   *
   * @return array<string, array<string|null|bool>>
   *   Array of test cases.
   */
  public function nodeCases(): array {
    return [
      'Go node on CMS' => ['12', TRUE, FALSE, 'https://go.cms.site'],
      'Go node on Go' => ['12', TRUE, TRUE, NULL],
      'CMS node on Go' => ['12', FALSE, TRUE, 'https://cms.site'],
      'CMS node on CMS' => ['12', FALSE, FALSE, NULL],
    ];
  }

  /**
   * Test that rewriting is disabled on admin pages.
   *
   * @dataProvider nodeCases
   */
  public function testNoRewritingOnAdminPages(
    string $nid,
    bool $isGoNode,
    bool $isGo,
    ?string $ignored,
  ): void {
    $node = $this->prophesize(EntityBase::class);
    $this->nodeStorage->load($nid)->willReturn($node);
    $this->goSite->isGoSite()->willReturn($isGo);
    $this->goSite->isGoNode($node)->willReturn($isGoNode);
    $this->goSite->getCmsBaseUrl()->willReturn('https://cms.site');
    $this->goSite->getGoBaseUrl()->willReturn('https://go.cms.site');
    $this->adminContext->isAdminRoute()->willReturn(TRUE);

    $options = [];
    $newPath = $this->pathProcessor->processOutbound(
      "/node/{$nid}",
      $options,
      new Request(),
      new BubbleableMetadata(),
    );

    $this->assertEquals("/node/{$nid}", $newPath);
    $this->assertArrayNotHasKey('base_url', $options);
  }

}
