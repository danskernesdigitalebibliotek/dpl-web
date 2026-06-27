<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Types;

class AppType
{
    public const MYBIBLO = 'MYBIBLO';
    public const BIBLO = 'BIBLO';
    public const BIBLOGO = 'BIBLOGO';

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
