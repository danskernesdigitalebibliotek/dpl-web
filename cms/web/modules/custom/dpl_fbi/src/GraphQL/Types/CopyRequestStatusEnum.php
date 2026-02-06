<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class CopyRequestStatusEnum
{
    public const OK = 'OK';
    public const ERROR_UNAUTHENTICATED_USER = 'ERROR_UNAUTHENTICATED_USER';
    public const ERROR_AGENCY_NOT_SUBSCRIBED = 'ERROR_AGENCY_NOT_SUBSCRIBED';
    public const ERROR_INVALID_PICKUP_BRANCH = 'ERROR_INVALID_PICKUP_BRANCH';
    public const ERROR_PID_NOT_RESERVABLE = 'ERROR_PID_NOT_RESERVABLE';
    public const ERROR_MISSING_CLIENT_CONFIGURATION = 'ERROR_MISSING_CLIENT_CONFIGURATION';
    public const ERROR_MUNICIPALITYAGENCYID_NOT_FOUND = 'ERROR_MUNICIPALITYAGENCYID_NOT_FOUND';
    public const ERROR_MISSING_MUNICIPALITYAGENCYID = 'ERROR_MISSING_MUNICIPALITYAGENCYID';
    public const UNKNOWN_USER = 'UNKNOWN_USER';
    public const BORCHK_USER_BLOCKED_BY_AGENCY = 'BORCHK_USER_BLOCKED_BY_AGENCY';
    public const BORCHK_USER_NO_LONGER_EXIST_ON_AGENCY = 'BORCHK_USER_NO_LONGER_EXIST_ON_AGENCY';
    public const BORCHK_USER_NOT_VERIFIED = 'BORCHK_USER_NOT_VERIFIED';
    public const INTERNAL_ERROR = 'INTERNAL_ERROR';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
