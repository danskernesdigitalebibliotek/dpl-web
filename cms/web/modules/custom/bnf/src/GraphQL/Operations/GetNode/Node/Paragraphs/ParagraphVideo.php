<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaVideotool|null $embedVideoRequired
 */
class ParagraphVideo extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideoRequired\MediaVideotool|null $embedVideoRequired
     */
    public static function make(
        $id,
        $embedVideoRequired = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'ParagraphVideo';
        if ($embedVideoRequired !== self::UNDEFINED) {
            $instance->embedVideoRequired = $embedVideoRequired;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'embedVideoRequired' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideoRequired\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideoRequired\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideoRequired\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideoRequired\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\EmbedVideoRequired\\MediaVideotool',
        ])),
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
