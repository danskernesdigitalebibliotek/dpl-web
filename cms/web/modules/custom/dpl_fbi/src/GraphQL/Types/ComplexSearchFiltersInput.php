<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property array<string>|null $agencyId
 * @property array<string>|null $branch
 * @property array<string>|null $branchId
 * @property array<string>|null $circulationRule
 * @property array<string>|null $department
 * @property string|null $firstAccessionDate
 * @property array<string>|null $floatGroup
 * @property array<string>|null $issueId
 * @property array<string>|null $itemId
 * @property string|null $lastloandate
 * @property array<string>|null $loanrestriction
 * @property array<string>|null $location
 * @property array<string>|null $section
 * @property array<string>|null $status
 * @property array<string>|null $sublocation
 * @property bool|null $useOnlineHoldings
 */
class ComplexSearchFiltersInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param array<string>|null $agencyId
     * @param array<string>|null $branch
     * @param array<string>|null $branchId
     * @param array<string>|null $circulationRule
     * @param array<string>|null $department
     * @param string|null $firstAccessionDate
     * @param array<string>|null $floatGroup
     * @param array<string>|null $issueId
     * @param array<string>|null $itemId
     * @param string|null $lastloandate
     * @param array<string>|null $loanrestriction
     * @param array<string>|null $location
     * @param array<string>|null $section
     * @param array<string>|null $status
     * @param array<string>|null $sublocation
     * @param bool|null $useOnlineHoldings
     */
    public static function make(
        $agencyId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $branch = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $branchId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $circulationRule = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $department = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $firstAccessionDate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $floatGroup = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $issueId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $itemId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $lastloandate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $loanrestriction = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $location = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $section = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $status = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $sublocation = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $useOnlineHoldings = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($agencyId !== self::UNDEFINED) {
            $instance->__set('agencyId', $agencyId);
        }
        if ($branch !== self::UNDEFINED) {
            $instance->__set('branch', $branch);
        }
        if ($branchId !== self::UNDEFINED) {
            $instance->__set('branchId', $branchId);
        }
        if ($circulationRule !== self::UNDEFINED) {
            $instance->__set('circulationRule', $circulationRule);
        }
        if ($department !== self::UNDEFINED) {
            $instance->__set('department', $department);
        }
        if ($firstAccessionDate !== self::UNDEFINED) {
            $instance->__set('firstAccessionDate', $firstAccessionDate);
        }
        if ($floatGroup !== self::UNDEFINED) {
            $instance->__set('floatGroup', $floatGroup);
        }
        if ($issueId !== self::UNDEFINED) {
            $instance->__set('issueId', $issueId);
        }
        if ($itemId !== self::UNDEFINED) {
            $instance->__set('itemId', $itemId);
        }
        if ($lastloandate !== self::UNDEFINED) {
            $instance->__set('lastloandate', $lastloandate);
        }
        if ($loanrestriction !== self::UNDEFINED) {
            $instance->__set('loanrestriction', $loanrestriction);
        }
        if ($location !== self::UNDEFINED) {
            $instance->__set('location', $location);
        }
        if ($section !== self::UNDEFINED) {
            $instance->__set('section', $section);
        }
        if ($status !== self::UNDEFINED) {
            $instance->__set('status', $status);
        }
        if ($sublocation !== self::UNDEFINED) {
            $instance->__set('sublocation', $sublocation);
        }
        if ($useOnlineHoldings !== self::UNDEFINED) {
            $instance->__set('useOnlineHoldings', $useOnlineHoldings);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'agencyId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'branch' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'branchId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'circulationRule' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'department' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'firstAccessionDate' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'floatGroup' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'issueId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'itemId' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'lastloandate' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'loanrestriction' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'location' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'section' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'status' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\EnumConverter))),
            'sublocation' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
            'useOnlineHoldings' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
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
