<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class PatronHistoricalLoanConsentStatusEnum
{
    public const AGE_NOT_VERIFIABLE = 'AGE_NOT_VERIFIABLE';
    public const ERROR_UNAUTHENTICATED_TOKEN = 'ERROR_UNAUTHENTICATED_TOKEN';
    public const FAILED = 'FAILED';
    public const GRANTED = 'GRANTED';
    public const NOT_GRANTED = 'NOT_GRANTED';
    public const UNDER_AGE = 'UNDER_AGE';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
