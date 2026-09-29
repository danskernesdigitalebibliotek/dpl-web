<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class BookmarksStatusEnum
{
    public const ALREADY_EXISTS = 'ALREADY_EXISTS';
    public const FAILED = 'FAILED';
    public const INVALID_ID = 'INVALID_ID';
    public const INVALID_MATERIAL_ID = 'INVALID_MATERIAL_ID';
    public const NOT_FOUND = 'NOT_FOUND';
    public const OK = 'OK';
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
