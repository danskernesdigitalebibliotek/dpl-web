<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string $materialId
 */
class BookmarksInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $materialId
     */
    public static function make($materialId): self
    {
        $instance = new self;

        if ($materialId !== self::UNDEFINED) {
            $instance->materialId = $materialId;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'materialId' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
