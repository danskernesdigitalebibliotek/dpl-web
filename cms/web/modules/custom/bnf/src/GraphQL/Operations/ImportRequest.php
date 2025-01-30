<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\bnf\GraphQL\Operations\ImportRequest\ImportRequestResult>
 */
class ImportRequest extends \Spawnia\Sailor\Operation
{
    /**
     * @param string $uuid
     * @param string $callbackUrl
     */
    public static function execute($uuid, $callbackUrl): ImportRequest\ImportRequestResult
    {
        return self::executeOperation(
            $uuid,
            $callbackUrl,
        );
    }

    protected static function converters(): array
    {
        static $converters;

        return $converters ??= [
            ['uuid', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
            ['callbackUrl', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\StringConverter)],
        ];
    }

    public static function document(): string
    {
        return /* @lang GraphQL */ 'mutation ImportRequest($uuid: String!, $callbackUrl: String!) {
          __typename
          importRequest(uuid: $uuid, callbackUrl: $callbackUrl) {
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
