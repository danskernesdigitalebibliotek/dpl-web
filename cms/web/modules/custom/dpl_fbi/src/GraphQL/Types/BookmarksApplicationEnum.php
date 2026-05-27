<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class BookmarksApplicationEnum
{
    public const BIBLIOTEKDK = 'BIBLIOTEKDK';
    public const STUDIESOEG = 'STUDIESOEG';
    public const UNKNOWN = 'UNKNOWN';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
