<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files;

/**
 * @property string $id
 * @property string $name
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaFile\File $mediaFile
 * @property string $__typename
 */
class MediaDocument extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $name
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaFile\File $mediaFile
     */
    public static function make($id, $name, $mediaFile): self
    {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($name !== self::UNDEFINED) {
            $instance->name = $name;
        }
        if ($mediaFile !== self::UNDEFINED) {
            $instance->mediaFile = $mediaFile;
        }
        $instance->__typename = 'MediaDocument';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'name' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'mediaFile' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaFile\File),
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
