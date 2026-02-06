<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations;

/**
 * @property \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Manifestation $bestRepresentation
 * @property string $__typename
 */
class Manifestations extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Manifestation $bestRepresentation
     */
    public static function make($bestRepresentation): self
    {
        $instance = new self;

        if ($bestRepresentation !== self::UNDEFINED) {
            $instance->bestRepresentation = $bestRepresentation;
        }
        $instance->__typename = 'Manifestations';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'bestRepresentation' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Manifestation),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
