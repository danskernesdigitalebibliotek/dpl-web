<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch $cqlSearch
 * @property int $sliderAmountOfMaterials
 * @property string $__typename
 * @property string|null $title
 */
class ParagraphGoMaterialSliderAutomatic extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch $cqlSearch
     * @param int $sliderAmountOfMaterials
     * @param string|null $title
     */
    public static function make(
        $id,
        $cqlSearch,
        $sliderAmountOfMaterials,
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($cqlSearch !== self::UNDEFINED) {
            $instance->cqlSearch = $cqlSearch;
        }
        if ($sliderAmountOfMaterials !== self::UNDEFINED) {
            $instance->sliderAmountOfMaterials = $sliderAmountOfMaterials;
        }
        $instance->__typename = 'ParagraphGoMaterialSliderAutomatic';
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'cqlSearch' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch),
            'sliderAmountOfMaterials' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'title' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
