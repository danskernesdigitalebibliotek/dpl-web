<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\SingleLink\Link $singleLink
 * @property string $__typename
 * @property bool|null $targetBlank
 */
class ParagraphGoLink extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\SingleLink\Link $singleLink
     * @param bool|null $targetBlank
     */
    public static function make(
        $id,
        $singleLink,
        $targetBlank = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($singleLink !== self::UNDEFINED) {
            $instance->singleLink = $singleLink;
        }
        $instance->__typename = 'ParagraphGoLink';
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
            'singleLink' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\SingleLink\Link),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'targetBlank' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\BooleanConverter),
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
