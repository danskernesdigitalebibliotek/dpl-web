<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property int $facetLimit
 * @property array<string>|null $facets
 */
class ComplexSearchFacetsInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param int $facetLimit
     * @param array<string>|null $facets
     */
    public static function make(
        $facetLimit,
        $facets = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($facetLimit !== self::UNDEFINED) {
            $instance->facetLimit = $facetLimit;
        }
        if ($facets !== self::UNDEFINED) {
            $instance->facets = $facets;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'facetLimit' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            'facets' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\EnumConverter))),
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
