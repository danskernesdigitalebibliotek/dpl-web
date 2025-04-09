<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages;

/**
 * @property string $id
 * @property string $name
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaImage\Image $mediaImage
 * @property string $__typename
 * @property string|null $byline
 */
class MediaImage extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $name
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaImage\Image $mediaImage
     * @param string|null $byline
     */
    public static function make(
        $id,
        $name,
        $mediaImage,
        $byline = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($name !== self::UNDEFINED) {
            $instance->name = $name;
        }
        if ($mediaImage !== self::UNDEFINED) {
            $instance->mediaImage = $mediaImage;
        }
        $instance->__typename = 'MediaImage';
        if ($byline !== self::UNDEFINED) {
            $instance->byline = $byline;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'name' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'mediaImage' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaImage\Image),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'byline' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../../sailor.php');
    }
}
