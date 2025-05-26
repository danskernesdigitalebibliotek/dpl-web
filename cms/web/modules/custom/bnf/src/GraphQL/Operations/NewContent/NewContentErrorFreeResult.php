<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\NewContent;

class NewContentErrorFreeResult extends \Spawnia\Sailor\ErrorFreeResult
{
    public NewContent $data;

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../sailor.php');
    }
}
