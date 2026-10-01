<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property \Drupal\dpl_fbi\GraphQL\Types\BookmarkMaterialTypesSelectionInput $materialTypes
 */
class BookmarkSelectionInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Types\BookmarkMaterialTypesSelectionInput $materialTypes
     */
    public static function make($materialTypes): self
    {
        $instance = new self;

        if ($materialTypes !== self::UNDEFINED) {
            $instance->__set('materialTypes', $materialTypes);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'materialTypes' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Types\BookmarkMaterialTypesSelectionInput),
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
