<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class InfomediaErrorEnum
{
    public const SERVICE_NOT_LICENSED = 'SERVICE_NOT_LICENSED';
    public const SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';
    public const LIBRARY_NOT_FOUND = 'LIBRARY_NOT_FOUND';
    public const ERROR_IN_REQUEST = 'ERROR_IN_REQUEST';
    public const BORROWER_NOT_LOGGED_IN = 'BORROWER_NOT_LOGGED_IN';
    public const BORROWER_NOT_FOUND = 'BORROWER_NOT_FOUND';
    public const BORROWERCHECK_NOT_ALLOWED = 'BORROWERCHECK_NOT_ALLOWED';
    public const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';
    public const BORROWER_NOT_IN_MUNICIPALITY = 'BORROWER_NOT_IN_MUNICIPALITY';
    public const NO_AGENCYID = 'NO_AGENCYID';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
