<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class BookmarksOverallStatusEnum
{
    public const ERROR_MISSING_CLIENT_CONFIGURATION = 'ERROR_MISSING_CLIENT_CONFIGURATION';
    public const ERROR_UNAUTHENTICATED_TOKEN = 'ERROR_UNAUTHENTICATED_TOKEN';
    public const FAILED = 'FAILED';
    public const OK = 'OK';
    public const PARTIALLY_FAILED = 'PARTIALLY_FAILED';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
