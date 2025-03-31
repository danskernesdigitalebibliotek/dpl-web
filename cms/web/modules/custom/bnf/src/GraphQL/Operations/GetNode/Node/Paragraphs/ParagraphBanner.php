<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerLink\Link $bannerLink
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaVideotool|null $bannerImage
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text|null $underlinedTitle
 * @property string|null $bannerDescription
 */
class ParagraphBanner extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerLink\Link $bannerLink
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaAudio|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaDocument|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaImage|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerImage\MediaVideotool|null $bannerImage
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text|null $underlinedTitle
     * @param string|null $bannerDescription
     */
    public static function make(
        $id,
        $bannerLink,
        $bannerImage = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $underlinedTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $bannerDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($bannerLink !== self::UNDEFINED) {
            $instance->bannerLink = $bannerLink;
        }
        $instance->__typename = 'ParagraphBanner';
        if ($bannerImage !== self::UNDEFINED) {
            $instance->bannerImage = $bannerImage;
        }
        if ($underlinedTitle !== self::UNDEFINED) {
            $instance->underlinedTitle = $underlinedTitle;
        }
        if ($bannerDescription !== self::UNDEFINED) {
            $instance->bannerDescription = $bannerDescription;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'bannerLink' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerLink\Link),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'bannerImage' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'MediaAudio' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\BannerImage\\MediaAudio',
            'MediaDocument' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\BannerImage\\MediaDocument',
            'MediaImage' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\BannerImage\\MediaImage',
            'MediaVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\BannerImage\\MediaVideo',
            'MediaVideotool' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\BannerImage\\MediaVideotool',
        ])),
            'underlinedTitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text),
            'bannerDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
