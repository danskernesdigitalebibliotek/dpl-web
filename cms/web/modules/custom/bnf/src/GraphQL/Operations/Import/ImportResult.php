<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\Import;

class ImportResult extends \Spawnia\Sailor\Result
{
    public ?Import $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = Import::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(Import $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): ImportErrorFreeResult
    {
        return ImportErrorFreeResult::fromResult($this);
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
