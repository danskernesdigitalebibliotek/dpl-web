<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property string $id
 * @property string $materialGridLink
 * @property int $amountOfMaterials
 * @property string $__typename
 * @property string|null $materialGridDescription
 * @property string|null $materialGridTitle
 */
class ParagraphMaterialGridLinkAutomatic extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string $id
     * @param string $materialGridLink
     * @param int $amountOfMaterials
     * @param string|null $materialGridDescription
     * @param string|null $materialGridTitle
     */
    public static function make(
        $id,
        $materialGridLink,
        $amountOfMaterials,
        $materialGridDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $materialGridTitle = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($id !== self::UNDEFINED) {
            $instance->id = $id;
        }
        if ($materialGridLink !== self::UNDEFINED) {
            $instance->materialGridLink = $materialGridLink;
        }
        if ($amountOfMaterials !== self::UNDEFINED) {
            $instance->amountOfMaterials = $amountOfMaterials;
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
        static $converters;

        return $converters ??= [
            'id' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter),
            'materialGridLink' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'amountOfMaterials' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IntConverter),
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
        return \Safe\realpath(__DIR__ . '/../../../../../../../../../../sailor.php');
    }
}
