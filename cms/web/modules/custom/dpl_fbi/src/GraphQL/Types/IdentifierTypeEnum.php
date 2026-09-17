<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class IdentifierTypeEnum
{
    public const BARCODE = 'BARCODE';
    public const DOI = 'DOI';
    public const ISBN = 'ISBN';
    public const ISMN = 'ISMN';
    public const ISSN = 'ISSN';
    public const MOVIE = 'MOVIE';
    public const MUSIC = 'MUSIC';
    public const NOT_SPECIFIED = 'NOT_SPECIFIED';
    public const ORDER_NUMBER = 'ORDER_NUMBER';
    public const PUBLIZON = 'PUBLIZON';
    public const UPC = 'UPC';
    public const URI = 'URI';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
