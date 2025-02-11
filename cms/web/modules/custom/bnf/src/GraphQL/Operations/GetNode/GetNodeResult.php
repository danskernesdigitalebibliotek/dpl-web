<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNode;

class GetNodeResult extends \Spawnia\Sailor\Result
{
    public ?GetNode $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = GetNode::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(GetNode $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): GetNodeErrorFreeResult
    {
        return GetNodeErrorFreeResult::fromResult($this);
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
