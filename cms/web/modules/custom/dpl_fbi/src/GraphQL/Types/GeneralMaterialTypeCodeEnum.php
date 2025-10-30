<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class GeneralMaterialTypeCodeEnum
{
    public const ARTICLES = 'ARTICLES';
    public const AUDIO_BOOKS = 'AUDIO_BOOKS';
    public const BOARD_GAMES = 'BOARD_GAMES';
    public const BOOKS = 'BOOKS';
    public const COMICS = 'COMICS';
    public const COMPUTER_GAMES = 'COMPUTER_GAMES';
    public const EBOOKS = 'EBOOKS';
    public const FILMS = 'FILMS';
    public const IMAGE_MATERIALS = 'IMAGE_MATERIALS';
    public const MUSIC = 'MUSIC';
    public const NEWSPAPER_JOURNALS = 'NEWSPAPER_JOURNALS';
    public const OTHER = 'OTHER';
    public const PODCASTS = 'PODCASTS';
    public const SHEET_MUSIC = 'SHEET_MUSIC';
    public const TV_SERIES = 'TV_SERIES';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
