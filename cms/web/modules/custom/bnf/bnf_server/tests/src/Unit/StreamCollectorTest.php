<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf_server\Unit;

use Drupal\bnf_server\Collector\StreamCollector;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_metrics\MetricsRegistry;
use Drupal\taxonomy\TermInterface;
use Drupal\Tests\UnitTestCase;
use Prometheus\Storage\InMemory;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for the BNF stream collector.
 */
class StreamCollectorTest extends UnitTestCase {

  /**
   * Every subscribable term is published with its name.
   */
  public function testPublishesStreamNames(): void {
    $output = $this->render([
      $this->term('e9b1ac7d-3f1c-4a2b-9d0e-11d0b0b3a001', 'Sommerlæsning', 'categories'),
      $this->term('e9b1ac7d-3f1c-4a2b-9d0e-11d0b0b3a002', 'Krimi', 'tags'),
    ]);

    $this->assertStringContainsString(
      'dpl_cms_bnf_stream_info{environment="main",name="Sommerlæsning",project="dpl-cms-core",stream="e9b1ac7d-3f1c-4a2b-9d0e-11d0b0b3a001",vocabulary="categories"} 1',
      $output,
    );
    $this->assertStringContainsString('name="Krimi"', $output);
    $this->assertStringContainsString('vocabulary="tags"', $output);
  }

  /**
   * Only the vocabularies carrying a subscribe button are looked at.
   *
   * Publishing every term on the site would put the whole taxonomy into
   * Prometheus for the sake of two vocabularies.
   */
  public function testOnlyLoadsSubscribableVocabularies(): void {
    $storage = $this->prophesize(EntityStorageInterface::class);
    $storage->loadByProperties(['vid' => ['categories', 'tags']])
      ->willReturn([])
      ->shouldBeCalled();

    $this->renderWith($storage);
  }

  /**
   * Renders a registry holding only this collector.
   *
   * @param \Drupal\taxonomy\TermInterface[] $terms
   *   The subscribable terms on the site.
   *
   * @return string
   *   The scrape body.
   */
  private function render(array $terms): string {
    $storage = $this->prophesize(EntityStorageInterface::class);
    $storage->loadByProperties(['vid' => ['categories', 'tags']])->willReturn($terms);

    return $this->renderWith($storage);
  }

  /**
   * Renders a registry reading from the given term storage.
   *
   * @param \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface> $storage
   *   The term storage double.
   *
   * @return string
   *   The scrape body.
   */
  private function renderWith(object $storage): string {
    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('taxonomy_term')->willReturn($storage->reveal());

    $registry = new MetricsRegistry(
      $this->prophesize(LoggerInterface::class)->reveal(),
      new InMemory(),
      [new StreamCollector($entityTypeManager->reveal())],
      ['project' => 'dpl-cms-core', 'environment' => 'main'],
    );

    return $registry->render();
  }

  /**
   * Builds a term reporting the given UUID, name and vocabulary.
   *
   * @param string $uuid
   *   The UUID of the term.
   * @param string $name
   *   The name of the term.
   * @param string $vocabulary
   *   The vocabulary the term belongs to.
   *
   * @return \Drupal\taxonomy\TermInterface
   *   The double.
   */
  private function term(string $uuid, string $name, string $vocabulary): TermInterface {
    $term = $this->prophesize(TermInterface::class);
    $term->uuid()->willReturn($uuid);
    $term->getName()->willReturn($name);
    $term->bundle()->willReturn($vocabulary);

    return $term->reveal();
  }

}
