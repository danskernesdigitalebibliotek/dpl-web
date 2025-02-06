<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionTitle;

/**
 * @property string $__typename
 * @property string|null $value
 * @property string|null $format
 */
class Text extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param string|null $value
     * @param string|null $format
     */
    public static function make(
        $value = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
        $format = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        $instance->__typename = 'Text';
        if ($value !== self::UNDEFINED) {
            $instance->value = $value;
        }
        if ($format !== self::UNDEFINED) {
            $instance->format = $format;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'value' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'format' => new \Spawnia\Sailor\Convert\NullConverter(new \Spawnia\Sailor\Convert\StringConverter),
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
