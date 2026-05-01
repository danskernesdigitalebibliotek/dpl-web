<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaVideotool|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaVideotoolVertical> $medias
 * @property string $__typename
 */
class ParagraphMedias extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaVideotool|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaVideotoolVertical> $medias
     */
    public static function make($id, $medias): self
    {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($medias !== self::UNDEFINED) {
            $instance->medias = $medias;
        }
        $instance->__typename = 'ParagraphMedias';

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'medias' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Medias\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Medias\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Medias\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Medias\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Medias\\MediaVideotool',
            'MediaVideotoolVertical' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Medias\\MediaVideotoolVertical',
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
