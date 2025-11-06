<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class WorkTypeEnum
{
    public const ANALYSIS = 'ANALYSIS';
    public const ARTICLE = 'ARTICLE';
    public const BOOKDESCRIPTION = 'BOOKDESCRIPTION';
    public const GAME = 'GAME';
    public const LITERATURE = 'LITERATURE';
    public const MAP = 'MAP';
    public const MOVIE = 'MOVIE';
    public const MUSIC = 'MUSIC';
    public const OTHER = 'OTHER';
    public const PERIODICA = 'PERIODICA';
    public const PORTRAIT = 'PORTRAIT';
    public const REVIEW = 'REVIEW';
    public const SHEETMUSIC = 'SHEETMUSIC';
    public const TRACK = 'TRACK';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
