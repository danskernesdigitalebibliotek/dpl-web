<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\GetNodeMetaData;

class GetNodeMetaDataResult extends \Spawnia\Sailor\Result
{
    public ?GetNodeMetaData $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = GetNodeMetaData::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(GetNodeMetaData $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): GetNodeMetaDataErrorFreeResult
    {
        return GetNodeMetaDataErrorFreeResult::fromResult($this);
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
