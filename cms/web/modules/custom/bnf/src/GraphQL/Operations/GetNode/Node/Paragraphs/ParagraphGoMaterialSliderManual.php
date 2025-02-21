<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialSliderWorkIds\WorkId> $materialSliderWorkIds
 * @property string $__typename
 * @property string|null $title
 */
class ParagraphGoMaterialSliderManual extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialSliderWorkIds\WorkId> $materialSliderWorkIds
     * @param string|null $title
     */
    public static function make(
        $id,
        $materialSliderWorkIds,
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($materialSliderWorkIds !== self::UNDEFINED) {
            $instance->materialSliderWorkIds = $materialSliderWorkIds;
        }
        $instance->__typename = 'ParagraphGoMaterialSliderManual';
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
            'materialSliderWorkIds' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialSliderWorkIds\WorkId))),
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
