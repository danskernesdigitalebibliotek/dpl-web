<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property array<string>|null $accessTypes
 * @property array<string>|null $childrenOrAdults
 * @property array<string>|null $creators
 * @property array<string>|null $fictionNonfiction
 * @property array<string>|null $fictionalCharacters
 * @property array<string>|null $genreAndForm
 * @property array<string>|null $mainLanguages
 * @property array<string>|null $materialTypesGeneral
 * @property array<string>|null $materialTypesSpecific
 * @property array<string>|null $subjects
 * @property array<string>|null $workTypes
 * @property array<string>|null $year
 * @property array<string>|null $dk5
 * @property array<string>|null $gamePlatform
 * @property array<string>|null $branchId
 * @property array<string>|null $department
 * @property array<string>|null $location
 * @property array<string>|null $sublocation
 * @property array<string>|null $status
 * @property array<string>|null $canAlwaysBeLoaned
 * @property array<string>|null $age
 * @property array<string>|null $ageRange
 * @property array<string>|null $lixRange
 * @property array<string>|null $letRange
 * @property array<string>|null $generalAudience
 * @property array<string>|null $libraryRecommendation
 */
class SearchFiltersInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param array<string>|null $accessTypes
     * @param array<string>|null $childrenOrAdults
     * @param array<string>|null $creators
     * @param array<string>|null $fictionNonfiction
     * @param array<string>|null $fictionalCharacters
     * @param array<string>|null $genreAndForm
     * @param array<string>|null $mainLanguages
     * @param array<string>|null $materialTypesGeneral
     * @param array<string>|null $materialTypesSpecific
     * @param array<string>|null $subjects
     * @param array<string>|null $workTypes
     * @param array<string>|null $year
     * @param array<string>|null $dk5
     * @param array<string>|null $gamePlatform
     * @param array<string>|null $branchId
     * @param array<string>|null $department
     * @param array<string>|null $location
     * @param array<string>|null $sublocation
     * @param array<string>|null $status
     * @param array<string>|null $canAlwaysBeLoaned
     * @param array<string>|null $age
     * @param array<string>|null $ageRange
     * @param array<string>|null $lixRange
     * @param array<string>|null $letRange
     * @param array<string>|null $generalAudience
     * @param array<string>|null $libraryRecommendation
     */
    public static function make(
        $accessTypes = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $childrenOrAdults = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $creators = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $fictionNonfiction = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $fictionalCharacters = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $genreAndForm = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $mainLanguages = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialTypesGeneral = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialTypesSpecific = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $subjects = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $workTypes = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $year = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $dk5 = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $gamePlatform = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $branchId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $department = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $location = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $sublocation = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $status = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $canAlwaysBeLoaned = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $age = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $ageRange = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $lixRange = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $letRange = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $generalAudience = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $libraryRecommendation = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($accessTypes !== self::UNDEFINED) {
            $instance->accessTypes = $accessTypes;
        }
        if ($childrenOrAdults !== self::UNDEFINED) {
            $instance->childrenOrAdults = $childrenOrAdults;
        }
        if ($creators !== self::UNDEFINED) {
            $instance->creators = $creators;
        }
        if ($fictionNonfiction !== self::UNDEFINED) {
            $instance->fictionNonfiction = $fictionNonfiction;
        }
        if ($fictionalCharacters !== self::UNDEFINED) {
            $instance->fictionalCharacters = $fictionalCharacters;
        }
        if ($genreAndForm !== self::UNDEFINED) {
            $instance->genreAndForm = $genreAndForm;
        }
        if ($mainLanguages !== self::UNDEFINED) {
            $instance->mainLanguages = $mainLanguages;
        }
        if ($materialTypesGeneral !== self::UNDEFINED) {
            $instance->materialTypesGeneral = $materialTypesGeneral;
        }
        if ($materialTypesSpecific !== self::UNDEFINED) {
            $instance->materialTypesSpecific = $materialTypesSpecific;
        }
        if ($subjects !== self::UNDEFINED) {
            $instance->subjects = $subjects;
        }
        if ($workTypes !== self::UNDEFINED) {
            $instance->workTypes = $workTypes;
        }
        if ($year !== self::UNDEFINED) {
            $instance->year = $year;
        }
        if ($dk5 !== self::UNDEFINED) {
            $instance->dk5 = $dk5;
        }
        if ($gamePlatform !== self::UNDEFINED) {
            $instance->gamePlatform = $gamePlatform;
        }
        if ($branchId !== self::UNDEFINED) {
            $instance->branchId = $branchId;
        }
        if ($department !== self::UNDEFINED) {
            $instance->department = $department;
        }
        if ($location !== self::UNDEFINED) {
            $instance->location = $location;
        }
        if ($sublocation !== self::UNDEFINED) {
            $instance->sublocation = $sublocation;
        }
        if ($status !== self::UNDEFINED) {
            $instance->status = $status;
        }
        if ($canAlwaysBeLoaned !== self::UNDEFINED) {
            $instance->canAlwaysBeLoaned = $canAlwaysBeLoaned;
        }
        if ($age !== self::UNDEFINED) {
            $instance->age = $age;
        }
        if ($ageRange !== self::UNDEFINED) {
            $instance->ageRange = $ageRange;
        }
        if ($lixRange !== self::UNDEFINED) {
            $instance->lixRange = $lixRange;
        }
        if ($letRange !== self::UNDEFINED) {
            $instance->letRange = $letRange;
        }
        if ($generalAudience !== self::UNDEFINED) {
            $instance->generalAudience = $generalAudience;
        }
        if ($libraryRecommendation !== self::UNDEFINED) {
            $instance->libraryRecommendation = $libraryRecommendation;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'accessTypes' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'childrenOrAdults' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'creators' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'fictionNonfiction' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'fictionalCharacters' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'genreAndForm' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'mainLanguages' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'materialTypesGeneral' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'materialTypesSpecific' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'subjects' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'workTypes' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'year' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'dk5' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'gamePlatform' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'branchId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'department' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'location' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'sublocation' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'status' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\EnumConverter))),
            'canAlwaysBeLoaned' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'age' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'ageRange' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'lixRange' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'letRange' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'generalAudience' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'libraryRecommendation' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
