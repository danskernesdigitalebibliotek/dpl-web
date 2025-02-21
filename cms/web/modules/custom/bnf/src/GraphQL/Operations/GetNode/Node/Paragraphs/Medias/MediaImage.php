<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias;

/**
 * @property string $id
 * @property string $name
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaImage\Image $mediaImage
 * @property string $__typename
 */
class MediaImage extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $name
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaImage\Image $mediaImage
     */
    public static function make($id, $name, $mediaImage): self
    {
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

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'name' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'mediaImage' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaImage\Image),
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
