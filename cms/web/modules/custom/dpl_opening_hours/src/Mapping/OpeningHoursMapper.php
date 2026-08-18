<?php

namespace Drupal\dpl_opening_hours\Mapping;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursCreatePOSTRequest as OpeningHoursRequest;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInner as OpeningHoursResponse;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursListGET200ResponseInnerCategory as OpeningHoursCategory;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\dpl_opening_hours\Model\OpeningHoursInstance;
use Drupal\dpl_opening_hours\Model\Repetition\WeeklyRepetition;
use Drupal\taxonomy\TermInterface;
use Safe\DateTime;
use Safe\DateTimeImmutable;

/**
 * Mapper between value objects and OpenAPI request/response objects.
 */
class OpeningHoursMapper {

  /**
   * Constructor.
   */
  public function __construct(
    private EntityTypeManagerInterface $entityTypeManager,
    private RepetitionMapper $repetitionMapper,
  ) {}

  /**
   * Map an OpenAPI request to a value object.
   */
  public function fromRequest(OpeningHoursRequest $request) : OpeningHoursInstance {
    $branchId = $request->getBranchId();
    if ($branchId === NULL) {
      throw new \InvalidArgumentException('No branch id provided');
    }
    $branch = $this->entityTypeManager->getStorage('node')->load($branchId);
    if (!$branch || $branch->bundle() !== "branch") {
      throw new \InvalidArgumentException("Invalid branch id '{$branchId}'");
    }

    $categoryTitle = $request->getCategory()?->getTitle();
    if (!$categoryTitle) {
      throw new \InvalidArgumentException('No category title provided');
    }
    // This could in theory return multiple categories if they have the same
    // name. The taxonomy_unique module ensures that this is not the case.
    $categoryTerms = $this->entityTypeManager->getStorage('taxonomy_term')->loadByProperties([
      'name' => $categoryTitle,
      'vid' => 'opening_hours_categories',
    ]);
    $categoryTerm = reset($categoryTerms);
    if (!($categoryTerm instanceof TermInterface)) {
      throw new \InvalidArgumentException("Invalid category title '{$categoryTitle}'");
    }

    $repetitionData = $request->getRepetition();
    if (!$repetitionData) {
      throw new \InvalidArgumentException("Missing repetition data");
    }
    $repetition = $this->repetitionMapper->fromRequest($repetitionData);
    if ($repetition::class == WeeklyRepetition::class && $request->getDate() > $repetition->endDate) {
      throw new \InvalidArgumentException("Weekly repetition end date '{$repetition->endDate->format('Y-m-d')}' must not be before instance date '{$request->getDate()->format('Y-m-d')}'");
    }

    try {
      return new OpeningHoursInstance(
        $request->getId(),
        $branch,
        $categoryTerm,
        new DateTimeImmutable($request->getDate()?->format('Y-m-d') . " " . $request->getStartTime()),
        new DateTimeImmutable($request->getDate()?->format('Y-m-d') . " " . $request->getEndTime()),
        $repetition
      );
    }
    catch (\Exception $e) {
      throw new \InvalidArgumentException("Unable handle date: {$e->getMessage()}");
    }
  }

  /**
   * Map a value object to an OpenAPI response.
   */
  public function toResponse(OpeningHoursInstance $instance) : OpeningHoursResponse {
    $colorField = $instance->categoryTerm->get('field_opening_hours_color')->first();
    if (!$colorField) {
      throw new \LogicException('Unable to retrieve color');
    }
    $category = (new OpeningHoursCategory())
      ->setTitle((string) $instance->categoryTerm->label())
      ->setColor($colorField->getString());

    $repetitionResponse = $this->repetitionMapper->toResponse($instance->repetition);

    $branchIsilId = NULL;
    if ($instance->branch->hasField('field_agency_branch_id') && !$instance->branch->get('field_agency_branch_id')->isEmpty()) {
      $branchIsilId = (string) $instance->branch->get('field_agency_branch_id')->value;
    }

    return (new OpeningHoursResponse())
      ->setId($instance->id)
      ->setBranchId(intval($instance->branch->id()))
      ->setBranchName((string) $instance->branch->label())
      ->setBranchIsilId($branchIsilId)
      ->setCategory($category)
      ->setDate(new DateTime($instance->startTime->format('Y-m-d')))
      ->setStartTime($instance->startTime->format("H:i"))
      ->setEndTime($instance->endTime->format('H:i'))
      ->setRepetition($repetitionResponse);
  }

}
