<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationWorkId;

/**
 * @property string $__typename
 * @property string|null $material_type
 * @property string|null $work_id
 */
class WorkId extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $material_type
     * @param string|null $work_id
     */
    public static function make(
        $material_type = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $work_id = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        $instance->__typename = 'WorkId';
        if ($material_type !== self::UNDEFINED) {
            $instance->material_type = $material_type;
        }
        if ($work_id !== self::UNDEFINED) {
            $instance->work_id = $work_id;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'material_type' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'work_id' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../../sailor.php');
    }
}
