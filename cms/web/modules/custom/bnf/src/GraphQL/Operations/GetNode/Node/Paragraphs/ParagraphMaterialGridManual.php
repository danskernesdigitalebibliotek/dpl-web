<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $__typename
 * @property string|null $materialGridDescription
 * @property string|null $materialGridTitle
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialGridWorkIds\WorkId>|null $materialGridWorkIds
 */
class ParagraphMaterialGridManual extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string|null $materialGridDescription
     * @param string|null $materialGridTitle
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialGridWorkIds\WorkId>|null $materialGridWorkIds
     */
    public static function make(
        $id,
        $materialGridDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialGridTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialGridWorkIds = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        $instance->__typename = 'ParagraphMaterialGridManual';
        if ($materialGridDescription !== self::UNDEFINED) {
            $instance->materialGridDescription = $materialGridDescription;
        }
        if ($materialGridTitle !== self::UNDEFINED) {
            $instance->materialGridTitle = $materialGridTitle;
        }
        if ($materialGridWorkIds !== self::UNDEFINED) {
            $instance->materialGridWorkIds = $materialGridWorkIds;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'materialGridDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'materialGridTitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'materialGridWorkIds' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialGridWorkIds\WorkId))),
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
