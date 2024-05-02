<?php

namespace Drupal\Tests\dpl_opening_hours\Kernel;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequest as OpeningHoursRequest;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequestRepetition as OpeningHoursRepetitionRequest;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner as OpeningHoursResponse;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInnerCategory as OpeningHoursCategory;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInnerRepetition as OpeningHoursRepetitionResponse;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInnerRepetitionWeeklyData as OpeningHoursWeeklyData;
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
  protected static $modules = ['dpl_opening_hours', 'dpl_rest_base'];

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
    $responseData = $this->createOpeningHours(new DateTime(), "09:00", "17:00", "Open", 1);
    $this->assertCount(1, $responseData);
    $responseOpeningHours = reset($responseData);
    $this->assertNotEmpty($responseOpeningHours);
    $this->assertNotEmpty($responseOpeningHours->getId());
    $this->assertDateEquals(new DateTime(), $responseOpeningHours->getDate());
    $this->assertEquals("09:00", $responseOpeningHours->getStartTime());
    $this->assertEquals("17:00", $responseOpeningHours->getEndTime());
    $this->assertEquals(1, $responseOpeningHours->getBranchId());
    $this->assertEquals("Open", $responseOpeningHours->getCategory()?->getTitle());
    $this->assertNotEmpty($responseOpeningHours->getRepetition()?->getId());
    $this->assertEquals(OpeningHoursRepetitionType::None->value, $responseOpeningHours->getRepetition()->getType());
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
    $this->createOpeningHours(new DateTime("yesterday"), branchId: 1);
    $this->createOpeningHours(new DateTime("now"), branchId: 1);
    $this->createOpeningHours(new DateTime("tomorrow"), branchId: 1);
    $this->createOpeningHours(new DateTime("tomorrow"), branchId: 2);

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
    $response1Data = $this->createOpeningHours();
    $responseOpeningHours1 = reset($response1Data);
    $this->assertNotEmpty($responseOpeningHours1);
    $response2Data = $this->createOpeningHours();
    $responseOpeningHours2 = reset($response2Data);
    $this->assertNotEmpty($responseOpeningHours2);

    $this->assertNotEquals($responseOpeningHours1->getId(), $responseOpeningHours2->getId(), "Two created opening hours must not have the same id.");

    $openingHoursList = $this->listOpeningHours();
    $this->assertCount(2, $openingHoursList);
  }

  /**
   * Test that opening hours with a weekly repetition is created properly.
   */
  public function testCreateWeeklyRepetition(): void {
    $startDate = new DateTime('now');
    $endDate = new DateTime("+2weeks");
    $expectedDates = [
      new DateTime('now'),
      new DateTime('+1week'),
      new DateTime('+2weeks'),
    ];

    $createdOpeningHours = $this->createOpeningHours(
      date: $startDate,
      repetition: (new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::Weekly->value)
        ->setWeeklyData((new OpeningHoursWeeklyData())->setEndDate($endDate))
    );
    $this->assertCount(3, $createdOpeningHours);

    foreach ($expectedDates as $index => $expectedDate) {
      $this->assertDateEquals($expectedDate, $createdOpeningHours[$index]->getDate(), "Repeated opening hours for index $index does not match");
    }

    $createdIds = array_map(function (OpeningHoursResponse $openingHours) {
      return $openingHours->getId();
    }, $createdOpeningHours);

    $this->assertEquals($createdIds, array_filter($createdIds), "All created opening hours must have an id");
    $this->assertEquals($createdIds, array_unique($createdIds), "All created opening hours must have different ids");

    // Ensure the repetition for each opening hours has the same correct value.
    $repetitions = array_map(function (OpeningHoursResponse $openingHours) {
      return $openingHours->getRepetition();
    }, $createdOpeningHours);

    // Check that the first repetition is correct.
    $repetition = reset($repetitions);
    $this->assertInstanceOf(OpeningHoursRepetitionResponse::class, $repetition);
    $this->assertNotNull($repetition->getId(), "Created opening hours must have a valid repetiton id");
    $this->assertEquals($repetition->getType(), OpeningHoursRepetitionType::Weekly->value, "Created opening hours with weekly repetition must have the correct type");
    $this->assertDateEquals($repetition->getWeeklyData()?->getEndDate(), $endDate, "Created opening hours with weekly repetition must have the provided end date");

    // Check that all other repetitions match the first one to ensure that all
    // opening hours have the correct value.
    foreach ($repetitions as $otherRepetition) {
      $this->assertEquals($repetition, $otherRepetition, "All created opening hours with repetition should have the same repetition");
    }

    // Check that the same opening hours are returned when listed as when
    // created.
    $allOpeningHours = $this->listOpeningHours();
    $this->assertEquals($createdOpeningHours, $allOpeningHours);
  }

  /**
   * Test that an opening hours instance can be updated.
   */
  public function testUpdate(): void {
    $createdData = $this->createOpeningHours();
    $createdOpeningHours = reset($createdData);
    $this->assertNotEmpty($createdOpeningHours);

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
    $serializer = $this->container->get('dpl_rest_base.serializer');
    $updateRequest = new Request(content: $serializer->serialize($updateData, 'application/json'));

    $updateResponse = $updateResource->patch($id, $updateRequest);
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[] $updatedOpeningHours */
    $updatedOpeningHours = $serializer->deserialize($updateResponse->getContent(), 'array<' . OpeningHoursResponse::class . '>', 'application/json');
    $this->assertCount(1, $updatedOpeningHours, "Updating an opening hours without repetition must only return a single opening hours.");
    $firstUpdatedOpeningHours = $updatedOpeningHours[0];

    $this->assertEquals($createdOpeningHours->getId(), $firstUpdatedOpeningHours->getId(), "Opening hour ids should not change across updates");
    $this->assertDateEquals(new DateTime("tomorrow"), $updateData->getDate(), "Opening hour dates should change when updated");
    $this->assertEquals("10:00", $updateData->getStartTime());
    $this->assertEquals("18:00", $updateData->getEndTime());
    $this->assertEquals(2, $updateData->getBranchId());
    $this->assertEquals(OpeningHoursRepetitionType::None->value, $updateData->getRepetition()?->getType());
  }

  /**
   * Test that opening hours with weekly repetition can be created properly.
   */
  public function testUpdateInstanceInWeeklyRepetition(): void {
    $startDate = new DateTime('now');
    $endDate = new DateTime("+2weeks");

    $createdOpeningHours = $this->createOpeningHours(
      date: $startDate,
      repetition: (new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::Weekly->value)
        ->setWeeklyData((new OpeningHoursWeeklyData())->setEndDate($endDate))
    );
    $this->assertCount(3, $this->listOpeningHours());

    $createdOpeningHour = $createdOpeningHours[1];
    $this->assertNotNull($createdOpeningHour->getId(), "Created opening hours must have a valid id");

    $updateResource = OpeningHoursUpdateResource::create($this->container, [], '', '');
    $updateData = (new OpeningHoursRequest())
      ->setId($createdOpeningHour->getId())
      ->setDate(new DateTime('tomorrow'))
      ->setStartTime("10:00")
      ->setEndTime("18:00")
      // It is a bit tricky to set up multiple categories so do not change
      // these values for npw.
      ->setCategory($createdOpeningHour->getCategory())
      ->setBranchId(2)
      ->setRepetition((new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::None->value));
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Service\JmsSerializer $serializer */
    $serializer = $this->container->get('dpl_rest_base.serializer');
    $updateRequest = new Request(content: $serializer->serialize($updateData, 'application/json'));

    $updateResponse = $updateResource->patch($createdOpeningHour->getId(), $updateRequest);
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[] $updatedOpeningHours */
    $updatedOpeningHours = $serializer->deserialize($updateResponse->getContent(), 'array<' . OpeningHoursResponse::class . '>', 'application/json');
    $this->assertCount(1, $updatedOpeningHours);
    $updatedOpeningHours = $updatedOpeningHours[0];

    $this->assertNotEmpty($updatedOpeningHours->getRepetition()?->getId(), "Updated opening hours repetition must have an id");
    $this->assertNotEquals($createdOpeningHour->getRepetition()?->getId(), $updatedOpeningHours->getRepetition()->getId(), "Updated opening hours repetitions must have new ids");
    $this->assertEquals(OpeningHoursRepetitionType::None->value, $updatedOpeningHours->getRepetition()->getType(), "Updated opening hours repetitions are not repeated");

    $openingHoursAfterUpdate = $this->listOpeningHours();
    $this->assertCount(3, $openingHoursAfterUpdate);

    $repetitionIds = array_map(function (OpeningHoursResponse $openingHours) {
      return $openingHours->getRepetition()?->getId();
    }, $openingHoursAfterUpdate);

    $this->assertCount(2, array_filter($repetitionIds, fn ($id) => $id === $createdOpeningHour->getRepetition()?->getId()), "After update there should be one less instance of the old repetition");
    $this->assertCount(1, array_filter($repetitionIds, fn ($id) => $id === $updatedOpeningHours->getRepetition()->getId()), "After update there should be one instance of the new repetition");
  }

  /**
   * Test that updating a repetition with a repetition yields a new repetition.
   */
  public function testUpdateNewWeeklyRepetition(): void {
    $startDate = new DateTime('now');
    $endDate = new DateTime("+2weeks");

    $createdOpeningHours = $this->createOpeningHours(
      date: $startDate,
      repetition: (new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::Weekly->value)
        ->setWeeklyData((new OpeningHoursWeeklyData())->setEndDate($endDate))
    );
    $this->assertCount(3, $this->listOpeningHours());

    $createdOpeningHour = $createdOpeningHours[1];
    $this->assertNotNull($createdOpeningHour->getId(), "Created opening hours must have a valid id");

    $updateResource = OpeningHoursUpdateResource::create($this->container, [], '', '');
    $updateData = (new OpeningHoursRequest())
      ->setId($createdOpeningHour->getId())
      ->setDate($createdOpeningHour->getDate())
      ->setStartTime("10:00")
      ->setEndTime("18:00")
      ->setCategory($createdOpeningHour->getCategory())
      ->setBranchId($createdOpeningHour->getBranchId())
      ->setRepetition((new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::Weekly->value)
        ->setWeeklyData((new OpeningHoursWeeklyData())
          ->setEndDate(new DateTime('+3weeks'))
        )
      );
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Service\JmsSerializer $serializer */
    $serializer = $this->container->get('dpl_opening_hours.serializer');
    $updateRequest = new Request(content: $serializer->serialize($updateData, 'application/json'));

    $updateResponse = $updateResource->patch($createdOpeningHour->getId(), $updateRequest);
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[] $updatedOpeningHours */
    $updatedOpeningHours = $serializer->deserialize($updateResponse->getContent(), 'array<' . OpeningHoursResponse::class . '>', 'application/json');
    $this->assertCount(3, $updatedOpeningHours);
    $updatedOpeningHour = $updatedOpeningHours[0];
    $this->assertNotNull($updatedOpeningHour->getRepetition()->getId());
    $this->assertNotEquals($createdOpeningHour->getRepetition()->getId(), $updatedOpeningHour->getRepetition()->getId());

    $allOpeningHours = $this->listOpeningHours();
    $this->assertCount(4, $allOpeningHours);
  }

  /**
   * Test that an opening hours instance can be deleted.
   */
  public function testDelete(): void {
    $createdData = $this->createOpeningHours();
    $createdOpeningHours = reset($createdData);
    $this->assertNotEmpty($createdOpeningHours);

    $id = $createdOpeningHours->getId();
    $this->assertNotNull($id);

    $deleteResource = OpeningHoursDeleteResource::create($this->container, [], '', '');
    $response = $deleteResource->delete($id, new Request());
    $this->assertTrue($response->isSuccessful());

    $openingHoursList = $this->listOpeningHours();
    $this->assertCount(0, $openingHoursList);
  }

  /**
   * Test that opening hours with weekly repetition can be deleted.
   */
  public function testDeleteInstanceInWeeklyRepetition(): void {
    $startDate = new DateTime('now');
    $endDate = new DateTime("+2weeks");

    $createdOpeningHours = $this->createOpeningHours(
      $startDate,
      repetition: (new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::Weekly->value)
        ->setWeeklyData((new OpeningHoursWeeklyData())->setEndDate($endDate))
    );
    $this->assertCount(3, $this->listOpeningHours());

    $openingHours = $createdOpeningHours[1];
    $this->assertNotNull($openingHours->getId(), "Created opening hours must have a valid id");

    $deleteResource = OpeningHoursDeleteResource::create($this->container, [], '', '');
    $deleteResource->delete($openingHours->getId(), new Request());

    $openingHoursAfterDeletion = $this->listOpeningHours();
    $this->assertCount(2, $openingHoursAfterDeletion, "Deleting a single opening hour in a repetition should retain the remaining instances");

    $firstOpeningHours = $openingHoursAfterDeletion[0];
    $lastOpeningHours = $openingHoursAfterDeletion[1];

    $this->assertEquals(OpeningHoursRepetitionType::Weekly->value, $firstOpeningHours->getRepetition()?->getType());
    $this->assertDateEquals($endDate, $firstOpeningHours->getRepetition()?->getWeeklyData()?->getEndDate());
    $this->assertEquals($firstOpeningHours->getRepetition(), $lastOpeningHours->getRepetition());
  }

  /**
   * Test future instances of opening hours with repetition can be deleted.
   */
  public function testDeleteWeeklyRepetition(): void {
    $startDate = new DateTime('now');
    $endDate = new DateTime("+2weeks");

    $createdOpeningHours = $this->createOpeningHours(
      $startDate,
      repetition: (new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::Weekly->value)
        ->setWeeklyData((new OpeningHoursWeeklyData())->setEndDate($endDate))
    );
    // Create three more opening hour instances which should not be touched
    // as they will belong to a separate repetition.
    $this->createOpeningHours(
      $startDate,
      repetition: (new OpeningHoursRepetitionRequest())
        ->setType(OpeningHoursRepetitionType::Weekly->value)
        ->setWeeklyData((new OpeningHoursWeeklyData())->setEndDate($endDate))
    );
    $this->assertCount(6, $this->listOpeningHours());

    $openingHours = $createdOpeningHours[1];
    $this->assertNotNull($openingHours->getId(), "Created opening hours must have a valid id");
    $this->assertNotNull($openingHours->getRepetition()?->getId(), "Opening hours created with a repetition must have a repetition id.");

    $deleteResource = OpeningHoursDeleteResource::create($this->container, [], '', '');
    $deleteResource->delete($openingHours->getId(), new Request(['repetition_id' => $openingHours->getRepetition()->getId()]));

    $openingHoursAfterDeletion = $this->listOpeningHours();
    $this->assertCount(4, $openingHoursAfterDeletion, "Deleting an opening hour in a repetition with the repetition id should neither affect prior instances nor instances for other branches.");

    $firstOpeningHoursCreated = $createdOpeningHours[0];
    $remainingOpeningHoursInRepetition = array_filter($openingHoursAfterDeletion, function (OpeningHoursResponse $openingHours) use ($firstOpeningHoursCreated) {
      return $openingHours->getRepetition()?->getId() == $firstOpeningHoursCreated->getRepetition()?->getId();
    });
    $this->assertCount(1, $remainingOpeningHoursInRepetition, "The past instance should remain when deleting an instance with a repetition.");
    $this->assertEquals($firstOpeningHoursCreated->getId(), $remainingOpeningHoursInRepetition[0]->getId());
  }

  /**
   * Helper function for creating opening hours.
   *
   * Default values for arguments are for test cases where the actual date is
   * not relevant.
   *
   * @return \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[]
   *   The created opening hours.
   */
  protected function createOpeningHours(
    \DateTime $date = new DateTime("now"),
    string $startTime = "09:00",
    string $endTime = "17:00",
    string $categoryTitle = "Open",
    int $branchId = 1,
    ?OpeningHoursRepetitionRequest $repetition = NULL,
  ): array {
    $createResource = OpeningHoursCreateResource::create($this->container, [], '', '');

    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Service\JmsSerializer $serializer */
    $serializer = $this->container->get('dpl_rest_base.serializer');

    $repetition = $repetition ?? (new OpeningHoursRepetitionRequest())->setType(OpeningHoursRepetitionType::None->value);

    $requestData = (new OpeningHoursRequest())
      ->setDate($date)
      ->setStartTime($startTime)
      ->setEndTime($endTime)
      ->setCategory((new OpeningHoursCategory())->setTitle($categoryTitle))
      ->setBranchId($branchId)
      ->setRepetition($repetition);
    $request = new Request(content: $serializer->serialize($requestData, 'application/json'));
    $response = $createResource->post($request);

    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[] $responseData */
    $responseData = $serializer->deserialize($response->getContent(), "array<" . OpeningHoursResponse::class . ">", 'application/json');
    return $responseData;
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
    $serializer = $this->container->get('dpl_rest_base.serializer');
    /** @var \DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner[] $responseData */
    $responseData = $serializer->deserialize($response->getContent(), 'array<' . OpeningHoursResponse::class . '>', 'application/json');
    return $responseData;
  }

  /**
   * Assert that the dates of two date times are equal.
   */
  public function assertDateEquals(?\DateTimeInterface $expected, ?\DateTimeInterface $actual, string $message = ''): void {
    $this->assertNotNull($expected, "Expected date should not be null");
    $this->assertNotNull($actual, "Actual date should not be null");
    $this->assertEquals($expected->format('Y-m-d'), $actual->format('Y-m-d'), $message);
  }

}
