<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaVideotool> $goImages
 * @property string $__typename
 */
class ParagraphGoImages extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImages\MediaVideotool> $goImages
     */
    public static function make($id, $goImages): self
    {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($goImages !== self::UNDEFINED) {
            $instance->goImages = $goImages;
        }
        $instance->__typename = 'ParagraphGoImages';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'goImages' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImages\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImages\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImages\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImages\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\GoImages\\MediaVideotool',
        ])))),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../sailor.php');
    }
}
