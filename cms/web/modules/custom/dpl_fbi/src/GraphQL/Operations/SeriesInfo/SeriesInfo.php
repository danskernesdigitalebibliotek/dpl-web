<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo;

/**
 * @property string $__typename
 * @property \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Series|null $series
 */
class SeriesInfo extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Series|null $series
     */
    public static function make(
        $series = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        $instance->__typename = 'Query';
        if ($series !== self::UNDEFINED) {
            $instance->__set('series', $series);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'series' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Series),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../sailor.php');
    }
}
