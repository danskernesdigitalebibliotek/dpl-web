<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $heroTitle
 * @property string $__typename
 * @property string|null $heroContentType
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime|null $heroDate
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDescription\Text|null $heroDescription
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideotool|null $heroImage
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink\Link|null $heroLink
 */
class ParagraphHero extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $heroTitle
     * @param string|null $heroContentType
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime|null $heroDate
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDescription\Text|null $heroDescription
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroImage\MediaVideotool|null $heroImage
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink\Link|null $heroLink
     */
    public static function make(
        $id,
        $heroTitle,
        $heroContentType = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $heroDate = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $heroDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
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
        if ($heroContentType !== self::UNDEFINED) {
            $instance->heroContentType = $heroContentType;
        }
        if ($heroDate !== self::UNDEFINED) {
            $instance->heroDate = $heroDate;
        }
        if ($heroDescription !== self::UNDEFINED) {
            $instance->heroDescription = $heroDescription;
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
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'heroTitle' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'heroContentType' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'heroDate' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDate\DateTime),
            'heroDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroDescription\Text),
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
        return \Safe\realpath(__DIR__ . '/../../../../../../sailor.php');
    }
}
