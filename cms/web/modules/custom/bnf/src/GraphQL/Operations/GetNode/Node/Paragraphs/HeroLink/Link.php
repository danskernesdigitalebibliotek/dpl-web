<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink;

/**
 * @property bool $internal
 * @property string $__typename
 * @property string|null $title
 * @property string|null $url
 */
class Link extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param bool $internal
     * @param string|null $title
     * @param string|null $url
     */
    public static function make(
        $internal,
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $url = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($internal !== self::UNDEFINED) {
            $instance->internal = $internal;
        }
        $instance->__typename = 'Link';
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        if ($url !== self::UNDEFINED) {
            $instance->url = $url;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'internal' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'title' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'url' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
