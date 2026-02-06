<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property int $materialAmount
 * @property string $materialGridLink
 * @property string $__typename
 * @property string|null $materialGridDescription
 * @property string|null $materialGridTitle
 */
class ParagraphMaterialGridLinkAutomatic extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param int $materialAmount
     * @param string $materialGridLink
     * @param string|null $materialGridDescription
     * @param string|null $materialGridTitle
     */
    public static function make(
        $id,
        $materialAmount,
        $materialGridLink,
        $materialGridDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialGridTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($materialAmount !== self::UNDEFINED) {
            $instance->materialAmount = $materialAmount;
        }
        if ($materialGridLink !== self::UNDEFINED) {
            $instance->materialGridLink = $materialGridLink;
        }
        $instance->__typename = 'ParagraphMaterialGridLinkAutomatic';
        if ($materialGridDescription !== self::UNDEFINED) {
            $instance->materialGridDescription = $materialGridDescription;
        }
        if ($materialGridTitle !== self::UNDEFINED) {
            $instance->materialGridTitle = $materialGridTitle;
        }

        return $instance;
    }

    protected function converters(): array
    {
        /** @var array<string, \Spawnia\Sailor\Convert\TypeConverter>|null $converters */
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'materialAmount' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
            'materialGridLink' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'materialGridDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'materialGridTitle' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../sailor.php');
    }
}
