<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover;

/**
 * @property string $__typename
 * @property \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover\Large\CoverDetails|null $large
 */
class Cover extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover\Large\CoverDetails|null $large
     */
    public static function make(
        $large = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        $instance->__typename = 'Cover';
        if ($large !== self::UNDEFINED) {
            $instance->large = $large;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'large' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover\Large\CoverDetails),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../sailor.php');
    }
}
