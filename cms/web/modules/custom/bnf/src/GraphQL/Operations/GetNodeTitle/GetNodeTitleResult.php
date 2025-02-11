<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNodeTitle;

class GetNodeTitleResult extends \Spawnia\Sailor\Result
{
    public ?GetNodeTitle $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = GetNodeTitle::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(GetNodeTitle $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): GetNodeTitleErrorFreeResult
    {
        return GetNodeTitleErrorFreeResult::fromResult($this);
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../../sailor.php');
    }
}
