<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class PatronLoanStatusEnum
{
    public const ACTIVE = 'ACTIVE';
    public const OVERDUE = 'OVERDUE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
