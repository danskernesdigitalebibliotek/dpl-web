<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\ImportContext;
use Drupal\bnf\Plugin\bnf_mapper\FieldGoLinkRequiredMapper;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphNavSpotsManualMapper;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\Entity\Node;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Test BnfMapperImportReferencePluginBase.
 */
abstract class BnfMapperImportReferencePluginBaseTest extends UnitTestCase {

  /**
   * The subject under test.
   */
  protected FieldGoLinkRequiredMapper|ParagraphNavSpotsManualMapper $mapper;

  /**
   * Entity type manager prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityTypeManagerInterface>
   */
  protected ObjectProphecy $entityTypeManager;

  /**
   * Entity (node) storage prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $nodeStorage;

  /**
   * Entity (paragraph) storage prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $paragraphStorage;

  /**
   * Import context stack prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf\Services\ImportContextStack>
   */
  protected ObjectProphecy $importContextStack;

  /**
   * Import context prophecy.
   *
   * @var \Drupal\bnf\ImportContext
   */
  protected ImportContext $importContext;

  /**
   * BnfImporter prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf\Services\BnfImporter>
   */
  protected ObjectProphecy $importer;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();
    $this->entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);

    $this->paragraphStorage = $this->prophesize(EntityStorageInterface::class);
    $this->paragraphStorage->loadByProperties(Argument::any())->willReturn([]);
    $this->nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $this->nodeStorage->loadByProperties(Argument::any())->willReturn([]);
    $this->entityTypeManager->getStorage('node')->willReturn($this->nodeStorage);
    $this->entityTypeManager->getStorage('paragraph')->willReturn($this->paragraphStorage);

    $this->importContext = new ImportContext('some endpoint');

    $this->importContextStack = $this->prophesize(ImportContextStack::class);
    $this->importContextStack->current()->willReturn($this->importContext);
    $this->importContextStack->size()->willReturn(1);

    $this->importer = $this->prophesize(BnfImporter::class);
  }

  /**
   * Prophesize an existing node with UUID and URL.
   */
  protected function prophesizeExistingNode(string $nid, string $uuid): void {
    $nodeProphecy = $this->prophesizeNode($nid);

    $this->nodeStorage->loadByProperties(['uuid' => $uuid])->willReturn([$nodeProphecy]);
  }

  /**
   * Prophesize a previously imported node.
   */
  protected function prophesizeImportedNode(string $nid, string $uuid): void {
    $nodeProphecy = $this->prophesizeNode($nid);

    $this->importer->importNode($uuid, $this->importContext)->willReturn($nodeProphecy);
  }

  /**
   * Prophesize a node.
   *
   * @return \Prophecy\Prophecy\ObjectProphecy<\Drupal\node\Entity\Node>
   *   Node prophecy.
   */
  protected function prophesizeNode(string $nid): ObjectProphecy {
    $nodeProphecy = $this->prophesize(Node::class);
    $nodeProphecy->id()->willReturn($nid);

    return $nodeProphecy;
  }

}
