<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $__typename
 * @property bool|null $imagePositionRight
 * @property string|null $recommendationDescription
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationTitle\Text|null $recommendationTitle
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationWorkId\WorkId|null $recommendationWorkId
 */
class ParagraphRecommendation extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param bool|null $imagePositionRight
     * @param string|null $recommendationDescription
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationTitle\Text|null $recommendationTitle
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationWorkId\WorkId|null $recommendationWorkId
     */
    public static function make(
        $id,
        $imagePositionRight = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $recommendationDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $recommendationTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $recommendationWorkId = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'ParagraphRecommendation';
        if ($imagePositionRight !== self::UNDEFINED) {
            $instance->imagePositionRight = $imagePositionRight;
        }
        if ($recommendationDescription !== self::UNDEFINED) {
            $instance->recommendationDescription = $recommendationDescription;
        }
        if ($recommendationTitle !== self::UNDEFINED) {
            $instance->recommendationTitle = $recommendationTitle;
        }
        if ($recommendationWorkId !== self::UNDEFINED) {
            $instance->recommendationWorkId = $recommendationWorkId;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'imagePositionRight' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            'recommendationDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'recommendationTitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationTitle\Text),
            'recommendationWorkId' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationWorkId\WorkId),
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
