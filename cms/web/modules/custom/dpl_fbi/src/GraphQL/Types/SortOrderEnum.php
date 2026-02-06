<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class SortOrderEnum
{
    public const ASC = 'ASC';
    public const DESC = 'DESC';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
