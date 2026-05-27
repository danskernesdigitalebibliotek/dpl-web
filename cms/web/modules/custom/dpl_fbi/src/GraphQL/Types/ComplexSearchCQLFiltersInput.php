<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string|null $cqlfilterquery
 */
class ComplexSearchCQLFiltersInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $cqlfilterquery
     */
    public static function make(
        $cqlfilterquery = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($cqlfilterquery !== self::UNDEFINED) {
            $instance->cqlfilterquery = $cqlfilterquery;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'cqlfilterquery' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
