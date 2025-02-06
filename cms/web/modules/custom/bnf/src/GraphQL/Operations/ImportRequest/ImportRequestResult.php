<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\ImportRequest;

class ImportRequestResult extends \Spawnia\Sailor\Result
{
    public ?ImportRequest $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = ImportRequest::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(ImportRequest $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): ImportRequestErrorFreeResult
    {
        return ImportRequestErrorFreeResult::fromResult($this);
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
