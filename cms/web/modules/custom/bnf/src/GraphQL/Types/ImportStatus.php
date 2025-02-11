<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Types;

class ImportStatus
{
    public const success = 'success';
    public const failure = 'failure';
    public const duplicate = 'duplicate';

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../sailor.php');
    }
}
