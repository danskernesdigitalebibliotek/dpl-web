<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo;

/**
 * @property string $id
 * @property string $name
 * @property string $mediaOembedVideo
 * @property string $__typename
 */
class MediaVideo extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $name
     * @param string $mediaOembedVideo
     */
    public static function make($id, $name, $mediaOembedVideo): self
    {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($name !== self::UNDEFINED) {
            $instance->name = $name;
        }
        if ($mediaOembedVideo !== self::UNDEFINED) {
            $instance->mediaOembedVideo = $mediaOembedVideo;
        }
        $instance->__typename = 'MediaVideo';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'name' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'mediaOembedVideo' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
