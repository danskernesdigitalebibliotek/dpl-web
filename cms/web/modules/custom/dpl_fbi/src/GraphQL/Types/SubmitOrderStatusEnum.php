<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class SubmitOrderStatusEnum
{
    public const BORCHK_USER_BLOCKED_BY_AGENCY = 'BORCHK_USER_BLOCKED_BY_AGENCY';
    public const BORCHK_USER_NO_LONGER_EXIST_ON_AGENCY = 'BORCHK_USER_NO_LONGER_EXIST_ON_AGENCY';
    public const BORCHK_USER_NOT_VERIFIED = 'BORCHK_USER_NOT_VERIFIED';
    public const OWNED_ACCEPTED = 'OWNED_ACCEPTED';
    public const NOT_OWNED_ILL_LOC = 'NOT_OWNED_ILL_LOC';
    public const OWNED_WRONG_MEDIUMTYPE = 'OWNED_WRONG_MEDIUMTYPE';
    public const NOT_OWNED_WRONG_ILL_MEDIUMTYPE = 'NOT_OWNED_WRONG_ILL_MEDIUMTYPE';
    public const NOT_OWNED_NO_ILL_LOC = 'NOT_OWNED_NO_ILL_LOC';
    public const OWNED_OWN_CATALOGUE = 'OWNED_OWN_CATALOGUE';
    public const SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';
    public const UNKNOWN_PICKUPAGENCY = 'UNKNOWN_PICKUPAGENCY';
    public const UNKNOWN_USER = 'UNKNOWN_USER';
    public const INVALID_ORDER = 'INVALID_ORDER';
    public const ORS_ERROR = 'ORS_ERROR';
    public const NO_SERVICEREQUESTER = 'NO_SERVICEREQUESTER';
    public const AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR';
    public const UNKNOWN_ERROR = 'UNKNOWN_ERROR';
    public const ERROR_MISSING_PINCODE = 'ERROR_MISSING_PINCODE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
