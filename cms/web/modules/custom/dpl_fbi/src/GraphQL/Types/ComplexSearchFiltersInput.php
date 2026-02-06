<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property array<string>|null $branchId
 * @property array<string>|null $department
 * @property array<string>|null $location
 * @property array<string>|null $sublocation
 * @property array<string>|null $status
 * @property array<string>|null $agencyId
 * @property array<string>|null $branch
 * @property array<string>|null $itemId
 * @property array<string>|null $issueId
 * @property string|null $firstAccessionDate
 */
class ComplexSearchFiltersInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param array<string>|null $branchId
     * @param array<string>|null $department
     * @param array<string>|null $location
     * @param array<string>|null $sublocation
     * @param array<string>|null $status
     * @param array<string>|null $agencyId
     * @param array<string>|null $branch
     * @param array<string>|null $itemId
     * @param array<string>|null $issueId
     * @param string|null $firstAccessionDate
     */
    public static function make(
        $branchId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $department = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $location = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $sublocation = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $status = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $agencyId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $branch = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $itemId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $issueId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $firstAccessionDate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

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
        if ($agencyId !== self::UNDEFINED) {
            $instance->agencyId = $agencyId;
        }
        if ($branch !== self::UNDEFINED) {
            $instance->branch = $branch;
        }
        if ($itemId !== self::UNDEFINED) {
            $instance->itemId = $itemId;
        }
        if ($issueId !== self::UNDEFINED) {
            $instance->issueId = $issueId;
        }
        if ($firstAccessionDate !== self::UNDEFINED) {
            $instance->firstAccessionDate = $firstAccessionDate;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'branchId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'department' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'location' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'sublocation' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'status' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\EnumConverter))),
            'agencyId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'branch' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'itemId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'issueId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'firstAccessionDate' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
