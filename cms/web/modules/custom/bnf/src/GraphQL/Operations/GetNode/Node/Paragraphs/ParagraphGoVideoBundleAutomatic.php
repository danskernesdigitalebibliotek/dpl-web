<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch $cqlSearch
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool $embedVideo
 * @property string $goVideoTitle
 * @property int $videoAmountOfMaterials
 * @property string $__typename
 * @property string|null $url
 */
class ParagraphGoVideoBundleAutomatic extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch $cqlSearch
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool $embedVideo
     * @param string $goVideoTitle
     * @param int $videoAmountOfMaterials
     * @param string|null $url
     */
    public static function make(
        $id,
        $cqlSearch,
        $embedVideo,
        $goVideoTitle,
        $videoAmountOfMaterials,
        $url = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($cqlSearch !== self::UNDEFINED) {
            $instance->cqlSearch = $cqlSearch;
        }
        if ($embedVideo !== self::UNDEFINED) {
            $instance->embedVideo = $embedVideo;
        }
        if ($goVideoTitle !== self::UNDEFINED) {
            $instance->goVideoTitle = $goVideoTitle;
        }
        if ($videoAmountOfMaterials !== self::UNDEFINED) {
            $instance->videoAmountOfMaterials = $videoAmountOfMaterials;
        }
        $instance->__typename = 'ParagraphGoVideoBundleAutomatic';
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
            'cqlSearch' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch),
            'embedVideo' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideo\\MediaVideotool',
        ])),
            'goVideoTitle' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'videoAmountOfMaterials' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
