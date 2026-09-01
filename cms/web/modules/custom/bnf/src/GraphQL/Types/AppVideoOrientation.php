<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Types;

class AppVideoOrientation
{
    public const HORIZONTAL = 'HORIZONTAL';
    public const VERTICAL = 'VERTICAL';

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
