<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink;

/**
 * @property string $id
 * @property array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\Link\Link> $link
 * @property string $__typename
 * @property string|null $ariaLabel
 * @property bool|null $targetBlank
 */
class ParagraphGoLink extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param array<int, \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\Link\Link> $link
     * @param string|null $ariaLabel
     * @param bool|null $targetBlank
     */
    public static function make(
        $id,
        $link,
        $ariaLabel = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $targetBlank = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($link !== self::UNDEFINED) {
            $instance->link = $link;
        }
        $instance->__typename = 'ParagraphGoLink';
        if ($ariaLabel !== self::UNDEFINED) {
            $instance->ariaLabel = $ariaLabel;
        }
        if ($targetBlank !== self::UNDEFINED) {
            $instance->targetBlank = $targetBlank;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'link' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\ListConverter(new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLink\Link\Link))),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'ariaLabel' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'targetBlank' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
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
