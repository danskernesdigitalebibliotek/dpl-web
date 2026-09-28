<?php declare(strict_types=1);

namespace Drupal\dpl_fbi\GraphQL\Types;

class OrderTypeEnum
{
    public const ESTIMATE = 'ESTIMATE';
    public const HOLD = 'HOLD';
    public const LOAN = 'LOAN';
    public const NON_RETURNABLE_COPY = 'NON_RETURNABLE_COPY';
    public const NORMAL = 'NORMAL';
    public const STACK_RETRIEVAL = 'STACK_RETRIEVAL';

    public static function endpoint(): string
    {
        return 'fbi';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../sailor.php');
    }
}
