<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $__typename
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaVideotool>|null $files
 */
class ParagraphFiles extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaVideotool>|null $files
     */
    public static function make(
        $id,
        $files = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'ParagraphFiles';
        if ($files !== self::UNDEFINED) {
            $instance->files = $files;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'files' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Files\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Files\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Files\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Files\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\Files\\MediaVideotool',
        ])))),
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
