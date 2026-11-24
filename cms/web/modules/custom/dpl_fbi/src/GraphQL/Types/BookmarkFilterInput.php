<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

/**
 * @property string $workId
 */
class BookmarkFilterInput extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $workId
     */
    public static function make($workId): self
    {
        $instance = new self;

        if ($workId !== self::UNDEFINED) {
            $instance->__set('workId', $workId);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'workId' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
