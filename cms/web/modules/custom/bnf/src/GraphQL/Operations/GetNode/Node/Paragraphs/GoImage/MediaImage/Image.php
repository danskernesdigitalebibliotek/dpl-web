<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoImage\MediaImage;

/**
 * @property string $url
 * @property string $__typename
 * @property string|null $title
 * @property string|null $alt
 */
class Image extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $url
     * @param string|null $title
     * @param string|null $alt
     */
    public static function make(
        $url,
        $title = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $alt = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($url !== self::UNDEFINED) {
            $instance->url = $url;
        }
        $instance->__typename = 'Image';
        if ($title !== self::UNDEFINED) {
            $instance->title = $title;
        }
        if ($alt !== self::UNDEFINED) {
            $instance->alt = $alt;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'url' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'title' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'alt' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../../../sailor.php');
    }
}
