<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNodeMetaData\Node;

/**
 * @property string $id
 * @property string $title
 * @property string $bundle
 * @property string $__typename
 */
class NodeArticle extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $title
     * @param string $bundle
     */
    public static function make($id, $title, $bundle): self
    {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        if ($bundle !== self::UNDEFINED) {
            $instance->bundle = $bundle;
        }
        $instance->__typename = 'NodeArticle';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'title' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'bundle' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
