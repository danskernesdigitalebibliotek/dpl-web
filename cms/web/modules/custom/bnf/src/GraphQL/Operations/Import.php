<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\bnf\GraphQL\Operations\Import\ImportResult>
 */
class Import extends \Spawnia\Sailor\Operation
{
    /**
     * @param string $uuid
     * @param string $contentType
     * @param string $callbackUrl
     */
    public static function execute($uuid, $contentType, $callbackUrl): Import\ImportResult
    {
        return self::executeOperation(
            $uuid,
            $contentType,
            $callbackUrl,
        );
    }

    protected static function converters(): array
    {
        static $converters;

        return $converters ??= [
            ['uuid', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
            ['contentType', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
            ['callbackUrl', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
        ];
    }

    public static function document(): string
    {
        return /* @lang GraphQL */ 'mutation Import($uuid: String!, $contentType: String!, $callbackUrl: String!) {
          __typename
          import(uuid: $uuid, contentType: $contentType, callbackUrl: $callbackUrl) {
            __typename
            status
            message
          }
        }';
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../sailor.php');
    }
}
