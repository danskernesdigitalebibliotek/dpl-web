<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $__typename
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeArticle|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeGoArticle|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeGoCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeGoPage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodePage>|null $contentReferences
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text|null $underlinedTitle
 */
class ParagraphContentSlider extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeArticle|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeGoArticle|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeGoCategory|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodeGoPage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodePage>|null $contentReferences
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text|null $underlinedTitle
     */
    public static function make(
        $id,
        $contentReferences = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $underlinedTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'ParagraphContentSlider';
        if ($contentReferences !== self::UNDEFINED) {
            $instance->contentReferences = $contentReferences;
        }
        if ($underlinedTitle !== self::UNDEFINED) {
            $instance->underlinedTitle = $underlinedTitle;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'contentReferences' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'NodeArticle' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ContentReferences\\NodeArticle',
            'NodeGoArticle' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ContentReferences\\NodeGoArticle',
            'NodeGoCategory' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ContentReferences\\NodeGoCategory',
            'NodeGoPage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ContentReferences\\NodeGoPage',
            'NodePage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ContentReferences\\NodePage',
        ])))),
            'underlinedTitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text),
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
