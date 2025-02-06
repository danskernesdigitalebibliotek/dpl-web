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
class EntityMapperTestBase extends UnitTestCase {

  const ENTITY_NAME = '';
  const ENTITY_CLASS = '';

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

    if (empty(static::ENTITY_NAME) || empty(static::ENTITY_CLASS)) {
      throw new \LogicException('Test classes should define ENTITY_CLASS and ENTITY_NAME constants');
    }

    $this->entityManagerProphecy = $this->prophesize(EntityTypeManagerInterface::class);
    $this->storageProphecy = $this->prophesize(EntityStorageInterface::class);
    $this->entityManagerProphecy->getStorage(static::ENTITY_NAME)->willReturn($this->storageProphecy);
    $this->entityProphecy = $this->prophesize(static::ENTITY_CLASS);
  }

}
