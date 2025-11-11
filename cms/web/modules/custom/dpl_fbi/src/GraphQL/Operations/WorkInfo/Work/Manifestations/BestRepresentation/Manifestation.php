<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation;

/**
 * @property \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover\Cover $cover
 * @property string $__typename
 */
class Manifestation extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover\Cover $cover
     */
    public static function make($cover): self
    {
        $instance = new self;

        if ($cover !== self::UNDEFINED) {
            $instance->cover = $cover;
        }
        $instance->__typename = 'Manifestation';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'cover' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover\Cover),
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
