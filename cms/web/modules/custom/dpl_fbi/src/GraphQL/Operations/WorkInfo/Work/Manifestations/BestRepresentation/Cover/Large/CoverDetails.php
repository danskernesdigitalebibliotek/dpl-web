<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Operations\WorkInfo\Work\Manifestations\BestRepresentation\Cover\Large;

/**
 * @property string $__typename
 * @property string|null $url
 * @property int|null $height
 * @property int|null $width
 */
class CoverDetails extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $url
     * @param int|null $height
     * @param int|null $width
     */
    public static function make(
        $url = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $height = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $width = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        $instance->__typename = 'CoverDetails';
        if ($url !== self::UNDEFINED) {
            $instance->url = $url;
        }
        if ($height !== self::UNDEFINED) {
            $instance->height = $height;
        }
        if ($width !== self::UNDEFINED) {
            $instance->width = $width;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'url' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'height' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            'width' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\IntConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../sailor.php');
    }
}
