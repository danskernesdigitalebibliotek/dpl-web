<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage;

/**
 * @property string $name
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaImage\Image $mediaImage
 * @property string $id
 * @property string $__typename
 */
class MediaImage extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $name
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaImage\Image $mediaImage
     * @param string $id
     */
    public static function make($name, $mediaImage, $id): self
    {
        $instance = new self;

        if ($name !== self::UNDEFINED) {
            $instance->name = $name;
        }
        if ($mediaImage !== self::UNDEFINED) {
            $instance->mediaImage = $mediaImage;
        }
        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'MediaImage';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'name' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'mediaImage' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaImage\Image),
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
