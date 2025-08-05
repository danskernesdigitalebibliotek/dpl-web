<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work;

/**
 * @property \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Titles\WorkTitles $titles
 * @property string $__typename
 */
class Work extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Titles\WorkTitles $titles
     */
    public static function make($titles): self
    {
        $instance = new self;

        if ($titles !== self::UNDEFINED) {
            $instance->titles = $titles;
        }
        $instance->__typename = 'Work';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'titles' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Titles\WorkTitles),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
