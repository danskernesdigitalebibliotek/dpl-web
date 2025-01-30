<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node;

/**
 * @property string $id
 * @property string $title
 * @property string $__typename
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphVideo>|null $paragraphs
 */
class NodeArticle extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $title
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBreadcrumbChildren|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFilteredEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphManualEventList|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody|\Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphVideo>|null $paragraphs
     */
    public static function make(
        $id,
        $title,
        $paragraphs = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        $instance->__typename = 'NodeArticle';
        if ($paragraphs !== self::UNDEFINED) {
            $instance->paragraphs = $paragraphs;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'title' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'paragraphs' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\PolymorphicConverter([
            'ParagraphAccordion' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphAccordion',
            'ParagraphBanner' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphBanner',
            'ParagraphBreadcrumbChildren' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphBreadcrumbChildren',
            'ParagraphCardGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphCardGridAutomatic',
            'ParagraphCardGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphCardGridManual',
            'ParagraphContentSlider' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphContentSlider',
            'ParagraphContentSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphContentSliderAutomatic',
            'ParagraphFilteredEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphFilteredEventList',
            'ParagraphGoLinkbox' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoLinkbox',
            'ParagraphGoMaterialSliderAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoMaterialSliderAutomatic',
            'ParagraphGoMaterialSliderManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoMaterialSliderManual',
            'ParagraphGoVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoVideo',
            'ParagraphGoVideoBundleAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoVideoBundleAutomatic',
            'ParagraphGoVideoBundleManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphGoVideoBundleManual',
            'ParagraphManualEventList' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphManualEventList',
            'ParagraphMaterialGridAutomatic' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphMaterialGridAutomatic',
            'ParagraphMaterialGridManual' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphMaterialGridManual',
            'ParagraphMedias' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphMedias',
            'ParagraphTextBody' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphTextBody',
            'ParagraphVideo' => '\\Drupal\\bnf\\GraphQL\\Operations\\GetNode\\Node\\Paragraphs\\ParagraphVideo',
        ])))),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../sailor.php');
    }
}
