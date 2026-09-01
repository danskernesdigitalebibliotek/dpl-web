<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\Work;

/**
 * @property \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\Work\Manifestations\Manifestations $manifestations
 * @property string $__typename
 */
class Work extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\Work\Manifestations\Manifestations $manifestations
     */
    public static function make($manifestations): self
    {
        $instance = new self;

        if ($manifestations !== self::UNDEFINED) {
            $instance->__set('manifestations', $manifestations);
        }
        $instance->__typename = 'Work';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'manifestations' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\SeriesInfo\Series\Members\Work\Manifestations\Manifestations),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../sailor.php');
    }
}
