<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class OrderBookmarksByEnum
{
    public const CREATEDAT_ASC = 'CREATEDAT_ASC';
    public const CREATEDAT_DESC = 'CREATEDAT_DESC';
    public const TITLE_ASC = 'TITLE_ASC';
    public const TITLE_DESC = 'TITLE_DESC';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
