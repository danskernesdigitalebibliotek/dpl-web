<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property array<string>|null $general
 * @property array<string>|null $specific
 */
class BookmarkMaterialTypesSelectionInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param array<string>|null $general
     * @param array<string>|null $specific
     */
    public static function make(
        $general = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $specific = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($general !== self::UNDEFINED) {
            $instance->__set('general', $general);
        }
        if ($specific !== self::UNDEFINED) {
            $instance->__set('specific', $specific);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'general' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\EnumConverter))),
            'specific' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
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
