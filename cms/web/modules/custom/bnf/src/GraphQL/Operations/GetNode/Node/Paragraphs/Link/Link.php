<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link;

/**
 * @property bool $internal
 * @property string $__typename
 * @property string|null $url
 * @property string|null $title
 */
class Link extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param bool $internal
     * @param string|null $url
     * @param string|null $title
     */
    public static function make(
        $internal,
        $url = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($internal !== self::UNDEFINED) {
            $instance->internal = $internal;
        }
        $instance->__typename = 'Link';
        if ($url !== self::UNDEFINED) {
            $instance->url = $url;
        }
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'internal' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'url' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'title' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
