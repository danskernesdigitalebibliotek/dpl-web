<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series;

/**
 * @property string $title
 * @property array<int, \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\SerieWork> $members
 * @property string $__typename
 * @property string|null $description
 */
class Series extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $title
     * @param array<int, \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\SerieWork> $members
     * @param string|null $description
     */
    public static function make(
        $title,
        $members,
        $description = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        if ($members !== self::UNDEFINED) {
            $instance->members = $members;
        }
        $instance->__typename = 'Series';
        if ($description !== self::UNDEFINED) {
            $instance->description = $description;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'title' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'members' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\SerieWork))),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'description' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../sailor.php');
    }
}
