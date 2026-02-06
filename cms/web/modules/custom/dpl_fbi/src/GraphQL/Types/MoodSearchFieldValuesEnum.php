<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class MoodSearchFieldValuesEnum
{
    public const ALL = 'ALL';
    public const TITLE = 'TITLE';
    public const CREATOR = 'CREATOR';
    public const MOODTAGS = 'MOODTAGS';
    public const ALLTAGS = 'ALLTAGS';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
