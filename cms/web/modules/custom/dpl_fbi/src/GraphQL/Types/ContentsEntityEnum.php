<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class ContentsEntityEnum
{
    public const ARTICLES = 'ARTICLES';
    public const CHAPTERS = 'CHAPTERS';
    public const FICTION = 'FICTION';
    public const MUSIC_TRACKS = 'MUSIC_TRACKS';
    public const NOT_SPECIFIED = 'NOT_SPECIFIED';
    public const SHEET_MUSIC = 'SHEET_MUSIC';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
