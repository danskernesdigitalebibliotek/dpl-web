<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work;

/**
 * @property \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Titles\WorkTitles $titles
 * @property \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\Manifestations $manifestations
 * @property string $__typename
 * @property array<int, string>|null $abstract
 */
class Work extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Titles\WorkTitles $titles
     * @param \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\Manifestations $manifestations
     * @param array<int, string>|null $abstract
     */
    public static function make(
        $titles,
        $manifestations,
        $abstract = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($titles !== self::UNDEFINED) {
            $instance->titles = $titles;
        }
        if ($manifestations !== self::UNDEFINED) {
            $instance->manifestations = $manifestations;
        }
        $instance->__typename = 'Work';
        if ($abstract !== self::UNDEFINED) {
            $instance->abstract = $abstract;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'titles' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Titles\WorkTitles),
            'manifestations' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\Manifestations),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'abstract' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter))),
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
