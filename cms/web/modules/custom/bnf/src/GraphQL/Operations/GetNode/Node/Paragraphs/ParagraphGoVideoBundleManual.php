<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool $embedVideo
 * @property string $goVideoTitle
 * @property string $__typename
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\VideoBundleWorkIds\WorkId>|null $videoBundleWorkIds
 * @property string|null $url
 */
class ParagraphGoVideoBundleManual extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool $embedVideo
     * @param string $goVideoTitle
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\VideoBundleWorkIds\WorkId>|null $videoBundleWorkIds
     * @param string|null $url
     */
    public static function make(
        $id,
        $embedVideo,
        $goVideoTitle,
        $videoBundleWorkIds = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $url = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($embedVideo !== self::UNDEFINED) {
            $instance->embedVideo = $embedVideo;
        }
        if ($goVideoTitle !== self::UNDEFINED) {
            $instance->goVideoTitle = $goVideoTitle;
        }
        $instance->__typename = 'ParagraphGoVideoBundleManual';
        if ($videoBundleWorkIds !== self::UNDEFINED) {
            $instance->videoBundleWorkIds = $videoBundleWorkIds;
        }
        if ($url !== self::UNDEFINED) {
            $instance->url = $url;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'embedVideo' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaVideotool',
        ])),
            'goVideoTitle' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'videoBundleWorkIds' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\VideoBundleWorkIds\WorkId))),
            'url' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
