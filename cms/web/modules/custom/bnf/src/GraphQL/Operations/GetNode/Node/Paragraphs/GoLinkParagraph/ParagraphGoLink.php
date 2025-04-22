<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph;

/**
 * @property string $id
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link $linkRequired
 * @property string $__typename
 * @property bool|null $targetBlank
 * @property string|null $ariaLabel
 */
class ParagraphGoLink extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link $linkRequired
     * @param bool|null $targetBlank
     * @param string|null $ariaLabel
     */
    public static function make(
        $id,
        $linkRequired,
        $targetBlank = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $ariaLabel = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($linkRequired !== self::UNDEFINED) {
            $instance->linkRequired = $linkRequired;
        }
        $instance->__typename = 'ParagraphGoLink';
        if ($targetBlank !== self::UNDEFINED) {
            $instance->targetBlank = $targetBlank;
        }
        if ($ariaLabel !== self::UNDEFINED) {
            $instance->ariaLabel = $ariaLabel;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'linkRequired' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'targetBlank' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
            'ariaLabel' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
