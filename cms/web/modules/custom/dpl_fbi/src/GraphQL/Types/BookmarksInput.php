<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string $materialId
 * @property \Drupal\dpl_fbi\GraphQL\Types\BookmarkSelectionInput|null $selection
 */
class BookmarksInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $materialId
     * @param \Drupal\dpl_fbi\GraphQL\Types\BookmarkSelectionInput|null $selection
     */
    public static function make(
        $materialId,
        $selection = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($materialId !== self::UNDEFINED) {
            $instance->__set('materialId', $materialId);
        }
        if ($selection !== self::UNDEFINED) {
            $instance->__set('selection', $selection);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'materialId' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'selection' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\dpl_fbi\GraphQL\Types\BookmarkSelectionInput),
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
