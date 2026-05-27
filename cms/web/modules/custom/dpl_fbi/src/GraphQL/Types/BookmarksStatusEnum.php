<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class BookmarksStatusEnum
{
    public const OK = 'OK';
    public const FAILED = 'FAILED';
    public const ALREADY_EXISTS = 'ALREADY_EXISTS';
    public const NOT_FOUND = 'NOT_FOUND';
    public const UNKNOWN_ERROR = 'UNKNOWN_ERROR';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
