<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Base class for testing mappers that produce entities.
 */
abstract class EntityMapperTestBase extends UnitTestCase {

  /**
   * EntityManager prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityTypeManagerInterface>
   */
  protected ObjectProphecy $entityManagerProphecy;

  /**
   * EntityStorage prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $storageProphecy;

  /**
   * Entity prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityBase>
   */
  protected ObjectProphecy $entityProphecy;

  /**
   * Setup for each test.
   */
  public function setUp(): void {
    parent::setUp();

    $this->entityManagerProphecy = $this->prophesize(EntityTypeManagerInterface::class);
    $this->storageProphecy = $this->prophesize(EntityStorageInterface::class);
    $this->entityManagerProphecy->getStorage($this->getEntityName())->willReturn($this->storageProphecy);
    $this->entityProphecy = $this->prophesize($this->getEntityClass());
  }

  /**
   * Return the name of the entity type to work with.
   */
  abstract protected function getEntityName(): string;

  /**
   * Return the class name of the entity to work with.
   */
  abstract protected function getEntityClass(): string;

}
