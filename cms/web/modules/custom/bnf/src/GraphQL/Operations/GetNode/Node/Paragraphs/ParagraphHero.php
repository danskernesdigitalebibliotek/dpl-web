<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $heroTitle
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermBreadcrumbStructure|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermCategories|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermOpeningHoursCategories|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermScreenName|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermTags|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermWebformEmailCategories|null $heroCategories
 * @property string|null $heroContentType
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDescription\Text|null $heroDescription
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime|null $heroDate
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideotool|null $heroImage
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink\Link|null $heroLink
 */
class ParagraphHero extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $heroTitle
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermBreadcrumbStructure|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermCategories|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermOpeningHoursCategories|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermScreenName|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermTags|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroCategories\TermWebformEmailCategories|null $heroCategories
     * @param string|null $heroContentType
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDescription\Text|null $heroDescription
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime|null $heroDate
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideotool|null $heroImage
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink\Link|null $heroLink
     */
    public static function make(
        $id,
        $heroTitle,
        $heroCategories = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $heroContentType = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $heroDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $heroDate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $heroImage = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $heroLink = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($heroTitle !== self::UNDEFINED) {
            $instance->heroTitle = $heroTitle;
        }
        $instance->__typename = 'ParagraphHero';
        if ($heroCategories !== self::UNDEFINED) {
            $instance->heroCategories = $heroCategories;
        }
        if ($heroContentType !== self::UNDEFINED) {
            $instance->heroContentType = $heroContentType;
        }
        if ($heroDescription !== self::UNDEFINED) {
            $instance->heroDescription = $heroDescription;
        }
        if ($heroDate !== self::UNDEFINED) {
            $instance->heroDate = $heroDate;
        }
        if ($heroImage !== self::UNDEFINED) {
            $instance->heroImage = $heroImage;
        }
        if ($heroLink !== self::UNDEFINED) {
            $instance->heroLink = $heroLink;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'heroTitle' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'heroCategories' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'TermBreadcrumbStructure' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroCategories\\TermBreadcrumbStructure',
            'TermCategories' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroCategories\\TermCategories',
            'TermOpeningHoursCategories' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroCategories\\TermOpeningHoursCategories',
            'TermScreenName' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroCategories\\TermScreenName',
            'TermTags' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroCategories\\TermTags',
            'TermWebformEmailCategories' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroCategories\\TermWebformEmailCategories',
        ])),
            'heroContentType' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'heroDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDescription\Text),
            'heroDate' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime),
            'heroImage' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroImage\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroImage\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroImage\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroImage\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\HeroImage\\MediaVideotool',
        ])),
            'heroLink' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink\Link),
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
