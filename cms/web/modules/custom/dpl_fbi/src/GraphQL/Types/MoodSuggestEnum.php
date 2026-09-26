<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class MoodSuggestEnum
{
    public const CREATOR = 'CREATOR';
    public const TAG = 'TAG';
    public const TITLE = 'TITLE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
