<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class IdentifierTypeEnum
{
    public const UPC = 'UPC';
    public const URI = 'URI';
    public const DOI = 'DOI';
    public const ISBN = 'ISBN';
    public const ISSN = 'ISSN';
    public const ISMN = 'ISMN';
    public const MUSIC = 'MUSIC';
    public const MOVIE = 'MOVIE';
    public const PUBLIZON = 'PUBLIZON';
    public const NOT_SPECIFIED = 'NOT_SPECIFIED';
    public const ORDER_NUMBER = 'ORDER_NUMBER';
    public const BARCODE = 'BARCODE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
