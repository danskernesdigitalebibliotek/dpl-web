<?php

namespace Drupal\Tests\dpl_opening_hours\Kernel;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequest as OpeningHoursRequest;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequestRepetition as OpeningHoursRepetitionRequest;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner as OpeningHoursResponse;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInnerCategory as OpeningHoursCategory;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\TypedData\TypedDataInterface;
use Drupal\dpl_opening_hours\Mapping\OpeningHoursRepetitionType;
use Drupal\dpl_opening_hours\Plugin\rest\resource\OpeningHoursCreateResource;
use Drupal\dpl_opening_hours\Plugin\rest\resource\OpeningHoursDeleteResource;
use Drupal\dpl_opening_hours\Plugin\rest\resource\OpeningHoursResource;
use Drupal\dpl_opening_hours\Plugin\rest\resource\OpeningHoursUpdateResource;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\NodeInterface;
use Drupal\node\NodeStorageInterface;
use Drupal\taxonomy\TermInterface;
use Drupal\taxonomy\TermStorageInterface;
use Prophecy\Argument;
use Safe\DateTime;
use Symfony\Component\HttpFoundation\Request;

/**
 * Test case for opening hours resources.
 */
class OpeningHoursResourceTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['dpl_opening_hours'];

  /**
   * {@inheritDoc}
   */
  public function setUp(): void {
    parent::setUp();
    $this->installSchema('dpl_opening_hours', ['dpl_opening_hours_instance', 'dpl_opening_hours_repetition']);
  }

  /**
   * {@inheritDoc}
   */
  public function register(ContainerBuilder $container): void {
    $container->setParameter('serializer.formats', ['json']);

    // Setup mock storage for categories and branches. Even though we have a
    // working database it is too much hassle compared to the value to set
    // these up. In our case mocking them should be sufficient.
    $category = $this->prophesize(TermInterface::class)
      ->id()->willReturn(1)->getObjectProphecy()
      ->label()->willReturn('Open')->getObjectProphecy()
      ->get('field_opening_hours_color')->willReturn(
        $this->prophesize(FieldItemListInterface::class)
          ->first()->willReturn(
            $this->prophesize(TypedDataInterface::class)
              ->getString()->willReturn("blue")->getObjectProphecy()
              ->reveal()
          )->getObjectProphecy()
          ->reveal()
      )->getObjectProphecy();
    $categoryStorage = ($this->prophesize(TermStorageInterface::class))
      ->loadByProperties(Argument::any())->willReturn([$category->reveal()])->getObjectProphecy()
      ->load(Argument::any())->willReturn($category->reveal())->getObjectProphecy();
    $container->set('dpl_opening_hours.category_storage', $categoryStorage->reveal());

    $branchStorage = $this->prophesize(NodeStorageInterface::class);
    foreach ([1, 2] as $branchId) {
      $branchStorage->load($branchId)->willReturn(
        $this->prophesize(NodeInterface::class)
          ->bundle()->willReturn('branch')->getObjectProphecy()
          ->id()->willReturn($branchId)->getObjectProphecy()
      );
    }

    $container->set('dpl_opening_hours.branch_storage', $branchStorage->reveal());
  }

  /**
   * Test that an opening hours instance can be created.
   */
  public function testCreation(): void {
    $responseOpeningHours = $this->createOpeningHours(new DateTime(), "09:00", "17:00", "Open", 1);
    $this->assertNotEmpty($responseOpeningHours->getId());
    $this->assertDateEquals(new DateTime(), $responseOpeningHours->getDate());
    $this->assertEquals("09:00", $responseOpeningHours->getStartTime());
    $this->assertEquals("17:00", $responseOpeningHours->getEndTime());
    $this->assertEquals(1, $responseOpeningHours->getBranchId());
    $this->assertEquals("Open", $responseOpeningHours->getCategory()?->getTitle());
    $this->assertNotEmpty($responseOpeningHours->getRepetition()?->getId());
    $this->assertEquals(OpeningHoursRepetitionType::None->value, $responseOpeningHours->getRepetition()?->getType());
  }

  /**
   * Test that opening hours can be listed.
   */
  public function testList(): void {
    $this->createOpeningHours(new DateTime(), "09:00", "17:00", "Open", 1);

    $openingHoursList = $this->listOpeningHours();
    $this->assertCount(1, $openingHoursList);

    $openingHours = reset($openingHoursList);
    $this->assertNotFalse($openingHours);
    $this->assertDateEquals(new DateTime(), $openingHours->getDate());
    $this->assertEquals("09:00", $openingHours->getStartTime());
    $this->assertEquals("17:00", $openingHours->getEndTime());
    $this->assertEquals("Open", $openingHours->getCategory()?->getTitle());
    $this->assertEquals(1, $openingHours->getBranchId());
    $this->assertEquals(OpeningHoursRepetitionType::None->value, $openingHours->getRepetition()?->getType());
  }

  /**
   * Test that opening hours filters work.
   */
  public function testListFilters(): void {
    $this->createOpeningHours(new DateTime("yesterday"), "09:00", "17:00", "Open", 1);
    $this->createOpeningHours(new DateTime("now"), "09:00", "17:00", "Open", 1);
    $this->createOpeningHours(new DateTime("tomorrow"), "09:00", "17:00", "Open", 1);
    $this->createOpeningHours(new DateTime("tomorrow"), "09:00", "17:00", "Open", 2);

    $openingHoursByBranch = $this->listOpeningHours(branchId: 1);
    $this->assertCount(3, $openingHoursByBranch);
    $openingHoursByOtherBranch = $this->listOpeningHours(branchId: 2);
    $this->assertCount(1, $openingHoursByOtherBranch);

    $openingHoursByDate = $this->listOpeningHours(fromDate: new DateTime("now"), toDate: new DateTime("tomorrow"));
    $this->assertCount(3, $openingHoursByDate);

    $openingHoursByBranchAndDate = $this->listOpeningHours(branchId: 1, fromDate: new DateTime("now"), toDate: new DateTime("tomorrow"));
    $this->assertCount(2, $openingHoursByBranchAndDate);
  }

  /**
   * Test creation of multiple opening hours.
   */
  public function testMultipleCreation(): void {
    $responseOpeningHours1 = $this->createOpeningHours(new DateTime(), "09:00", "17:00", "Open", 1);
    $responseOpeningHours2 = $this->createOpeningHours(new DateTime(), "09:00", "17:00", "Open", 1);
    $this->assertNotEquals($responseOpeningHours1->getId(), $responseOpeningHours2->getId(), "Two created opening hours must not have the same id.");

    $openingHoursList = $this->listOpeningHours();
    $this->assertCount(2, $openingHoursList);
  }

  /**
   * Test that an opening hours instance can be updated.
   */
  public function testUpdate(): void {
    $createdOpeningHours = $this->createOpeningHours(new DateTime(), '09:00', '17:00', 'Open', 1);
    $id = $createdOpeningHours->getId();
    $this->assertNotNull($id);

    $updateResource = OpeningHoursUpdateResource::create($this->container, [], '', '');
    $updateData = (new OpeningHoursRequest())
      ->setId($id)
      ->setDate(new DateTime('tomorrow'))
      ->setStartTime("10:00")
      ->setEndTime("18:00")
      // It is a bit tricky to set up multiple categories so do not change
      // these values for npw.
      ->setCategory($createdOpeningHours->getCategory())
      ->setBranchId(2)
      ->setRepetition(
        (new OpeningHoursRepetitionRequest())
          ->setId($createdOpeningHours->getRepetition()?->getId())
          ->setType($createdOpeningHours->getRepetition()?->getType())
      );
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Service\JmsSerializer $serializer */
    $serializer = $this->container->get('dpl_opening_hours.serializer');
    $updateRequest = new Request(content: $serializer->serialize($updateData, 'application/json'));

    $updateResponse = $updateResource->patch($id, $updateRequest);
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner $updateData */
    $updatedOpeningHours = $serializer->deserialize($updateResponse->getContent(), OpeningHoursResponse::class, 'application/json');

    $this->assertEquals($createdOpeningHours->getId(), $updatedOpeningHours->getId(), "Opening hour ids should not change across updates");
    $this->assertDateEquals(new DateTime("tomorrow"), $updateData->getDate(), "Opening hour dates should change when updated");
    $this->assertEquals("10:00", $updateData->getStartTime());
    $this->assertEquals("18:00", $updateData->getEndTime());
    $this->assertEquals(2, $updateData->getBranchId());
    $this->assertEquals(OpeningHoursRepetitionType::None->value, $updateData->getRepetition()?->getType());
  }

  /**
   * Test that an opening hours instance can be deleted.
   */
  public function testDelete(): void {
    $createdOpeningHours = $this->createOpeningHours(new DateTime(), '09:00', '17:00', 'Open', 1);
    
    $id = $createdOpeningHours->getId();
    $this->assertNotNull($id);

    $deleteResource = OpeningHoursDeleteResource::create($this->container, [], '', '');
    $response = $deleteResource->delete($id);
    $this->assertTrue($response->isSuccessful());

    $openingHoursList = $this->listOpeningHours();
    $this->assertCount(0, $openingHoursList);
  }

  /**
   * Helper function for creating opening hours.
   *
   * @return OpeningHoursResponse[]
   */
  protected function createOpeningHours(
    \DateTime $date,
    string $startTime,
    string $endTime,
    string $categoryTitle,
    int $branchId,
  ): OpeningHoursResponse {
    $createResource = OpeningHoursCreateResource::create($this->container, [], '', '');

    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Service\JmsSerializer $serializer */
    $serializer = $this->container->get('dpl_opening_hours.serializer');

    $requestData = (new OpeningHoursRequest())
      ->setDate($date)
      ->setStartTime($startTime)
      ->setEndTime($endTime)
      ->setCategory((new OpeningHoursCategory())->setTitle($categoryTitle))
      ->setBranchId($branchId)
      ->setRepetition(
        (new OpeningHoursRepetitionRequest())
          ->setType(OpeningHoursRepetitionType::None->value)
      );
    $request = new Request(content: $serializer->serialize($requestData, 'application/json'));
    $response = $createResource->post($request);
    return $serializer->deserialize($response->getContent(), OpeningHoursResponse::class, 'application/json');
  }

  /**
   * Helper function for listing opening hours.
   *
   * @return \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[]
   *   The instances matching the filter.
   */
  public function listOpeningHours(?int $branchId = NULL, ?\DateTimeInterface $fromDate = NULL, ?\DateTimeInterface $toDate = NULL): array {
    $listResource = OpeningHoursResource::create($this->container, [], '', '');

    $query = [
      ...($branchId ? ['branch_id' => $branchId] : []),
      ...($fromDate ? ['from_date' => $fromDate->format('Y-m-d')] : []),
      ...($toDate ? ['to_date' => $toDate->format('Y-m-d')] : []),
    ];
    $response = $listResource->get((new Request($query)));

    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Service\JmsSerializer $serializer */
    $serializer = $this->container->get('dpl_opening_hours.serializer');
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[] $responseData */
    $responseData = $serializer->deserialize($response->getContent(), 'array<' . OpeningHoursResponse::class . '>', 'application/json');
    return $responseData;
  }

  /**
   * Assert that the dates of two date times are equal.
   */
  public function assertDateEquals(\DateTimeInterface $expected, ?\DateTimeInterface $actual, string $message = ''): void {
    $this->assertNotNull($actual, "Actual date should not be null");
    $this->assertEquals($expected->format('Y-m-d'), $actual->format('Y-m-d'), $message);
  }

}
