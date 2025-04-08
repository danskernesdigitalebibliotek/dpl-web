<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNodeMetaData;

class GetNodeMetaDataErrorFreeResult extends \Spawnia\Sailor\ErrorFreeResult
{
    public GetNodeMetaData $data;

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../sailor.php');
    }
}
