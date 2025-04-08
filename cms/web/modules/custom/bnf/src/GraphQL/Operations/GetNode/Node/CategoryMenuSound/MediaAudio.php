<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\CategoryMenuSound;

/**
 * @property string $id
 * @property string $name
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\CategoryMenuSound\MediaAudioFile\File $mediaAudioFile
 * @property string $__typename
 */
class MediaAudio extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $name
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\CategoryMenuSound\MediaAudioFile\File $mediaAudioFile
     */
    public static function make($id, $name, $mediaAudioFile): self
    {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($name !== self::UNDEFINED) {
            $instance->name = $name;
        }
        if ($mediaAudioFile !== self::UNDEFINED) {
            $instance->mediaAudioFile = $mediaAudioFile;
        }
        $instance->__typename = 'MediaAudio';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'name' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'mediaAudioFile' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\CategoryMenuSound\MediaAudioFile\File),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../sailor.php');
    }
}
