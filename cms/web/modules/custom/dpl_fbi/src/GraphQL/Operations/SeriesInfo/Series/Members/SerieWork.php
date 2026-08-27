<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members;

/**
 * @property \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\Work\Work $work
 * @property string $__typename
 * @property bool|null $readThisFirst
 */
class SerieWork extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\Work\Work $work
     * @param bool|null $readThisFirst
     */
    public static function make(
        $work,
        $readThisFirst = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($work !== self::UNDEFINED) {
            $instance->__set('work', $work);
        }
        $instance->__typename = 'SerieWork';
        if ($readThisFirst !== self::UNDEFINED) {
            $instance->__set('readThisFirst', $readThisFirst);
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'work' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\Work\Work),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'readThisFirst' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../sailor.php');
    }
}
