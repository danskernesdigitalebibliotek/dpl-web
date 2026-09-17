<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class OrderLoansByEnum
{
    public const DUEDATE_ASC = 'DUEDATE_ASC';
    public const DUEDATE_DESC = 'DUEDATE_DESC';
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
