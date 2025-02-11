<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\Import;

/**
 * @property \Drupal\bnf\GraphQL\Operations\Import\Import\ImportResponse $import
 * @property string $__typename
 */
class Import extends \Spawnia\Sailor\ObjectLike
{
    /**
     * @param \Drupal\bnf\GraphQL\Operations\Import\Import\ImportResponse $import
     */
    public static function make($import): self
    {
        $instance = new self;

        if ($import !== self::UNDEFINED) {
            $instance->import = $import;
        }
        $instance->__typename = 'Mutation';

        return $instance;
    }

    protected function converters(): array
    {
        static $converters;

        return $converters ??= [
            'import' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Drupal\bnf\GraphQL\Operations\Import\Import\ImportResponse),
            '__typename' => new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter),
        ];
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../sailor.php');
    }
}
