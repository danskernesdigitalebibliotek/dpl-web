<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs;

/**
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionTitle\Text $accordionTitle
 * @property string $__typename
 * @property \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionDescription\Text|null $accordionDescription
 */
class ParagraphAccordion extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionTitle\Text $accordionTitle
     * @param \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionDescription\Text|null $accordionDescription
     */
    public static function make(
        $accordionTitle,
        $accordionDescription = 'Special default value that allows Sailor to differentiate between explicitly passing null and not passing a value at all.',
    ): self {
        $instance = new self;

        if ($accordionTitle !== self::UNDEFINED) {
            $instance->accordionTitle = $accordionTitle;
        }
        $instance->__typename = 'ParagraphAccordion';
        if ($accordionDescription !== self::UNDEFINED) {
            $instance->accordionDescription = $accordionDescription;
        }

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'accordionTitle' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionTitle\Text),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
            'accordionDescription' => new \Spawnia\Sailor\Convert\NullConverter(new \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionDescription\Text),
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
