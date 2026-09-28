<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class PatronLoansOverallStatusEnum
{
    public const CONSENT_REQUIRED = 'CONSENT_REQUIRED';
    public const ERROR_MANUAL_ADDS_DISABLED = 'ERROR_MANUAL_ADDS_DISABLED';
    public const ERROR_UNAUTHENTICATED_TOKEN = 'ERROR_UNAUTHENTICATED_TOKEN';
    public const FAILED = 'FAILED';
    public const OK = 'OK';
    public const PARTIALLY_FAILED = 'PARTIALLY_FAILED';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
