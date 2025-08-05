<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class SuggestionTypeEnum
{
    public const SUBJECT = 'SUBJECT';
    public const TITLE = 'TITLE';
    public const CREATOR = 'CREATOR';
    public const COMPOSIT = 'COMPOSIT';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
