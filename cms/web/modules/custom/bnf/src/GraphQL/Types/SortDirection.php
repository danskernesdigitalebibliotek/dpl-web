<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Types;

class SortDirection
{
    public const ASC = 'ASC';
    public const DESC = 'DESC';

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../sailor.php');
    }
}
