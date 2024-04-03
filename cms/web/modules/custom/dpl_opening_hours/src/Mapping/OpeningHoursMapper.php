<?php

namespace Drupal\dpl_opening_hours\Mapping;

use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursGET200Response;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursGETRequest;
use DanskernesDigitaleBibliotek\CMS\Api\Model\DplOpeningHoursGETRequestCategory;
use Drupal\dpl_opening_hours\Model\OpeningHoursInstance;
use Drupal\node\NodeStorageInterface;
use Drupal\taxonomy\TermStorageInterface;
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
    private NodeStorageInterface $branchStorage,
    private TermStorageInterface $categoryStorage,
  ) {}

  /**
   * Map an OpenAPI request to a value object.
   */
  public function fromRequest(DplOpeningHoursGETRequest $request) : OpeningHoursInstance {
    $branch = $this->branchStorage->load($request->getBranchId());
    if (!$branch || $branch->bundle() !== "branch") {
      throw new \InvalidArgumentException("Invalid branch id '{$request->getBranchId()}'");
    }

    $categoryTitle = $request->getCategory()?->getTitle();
    if (!$categoryTitle) {
      throw new \InvalidArgumentException('No category title provided');
    }
    // This could in theory return multiple categories if they have the same
    // name. The taxonomy_unique module ensures that this is not the case.
    $categoryTerms = $this->categoryStorage->loadByProperties([
      'name' => $categoryTitle,
      'vid' => 'opening_hours_categories',
    ]);
    $categoryTerm = reset($categoryTerms);
    if (!$categoryTerm) {
      throw new \InvalidArgumentException("Invalid category title '{$categoryTitle}'");
    }

    try {
      return new OpeningHoursInstance(
        $request->getId(),
        $branch,
        $categoryTerm,
        new DateTimeImmutable($request->getDate()?->format('Y-m-d') . " " . $request->getStartTime()),
        new DateTimeImmutable($request->getDate()?->format('Y-m-d') . " " . $request->getEndTime()),
      );
    }
    catch (\Exception $e) {
      throw new \InvalidArgumentException("Unable handle date: {$e->getMessage()}");
    }
  }

  /**
   * Map a value object to an OpenAPI response.
   */
  public function toResponse(OpeningHoursInstance $instance) : DplOpeningHoursGET200Response {
    $colorField = $instance->categoryTerm->get('field_opening_hours_color')->first();
    if (!$colorField) {
      throw new \LogicException('Unable to retrieve color');
    }
    $category = (new DplOpeningHoursGETRequestCategory())
      ->setTitle((string) $instance->categoryTerm->label())
      ->setColor($colorField->getString());

    return (new DplOpeningHoursGET200Response())
      ->setId($instance->id)
      ->setBranchId(intval($instance->branch->id()))
      ->setCategory($category)
      ->setDate(new DateTime($instance->startTime->format('Y-m-d')))
      ->setStartTime($instance->startTime->format("H:i"))
      ->setEndTime($instance->endTime->format('H:i'));
  }

}
