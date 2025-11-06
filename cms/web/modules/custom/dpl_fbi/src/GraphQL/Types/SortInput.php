<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string $index
 * @property string $order
 */
class SortInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $index
     * @param string $order
     */
    public static function make($index, $order): self
    {
        $instance = new self;

        if ($index !== self::UNDEFINED) {
            $instance->index = $index;
        }
        if ($order !== self::UNDEFINED) {
            $instance->order = $order;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'index' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'order' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\EnumConverter),
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
