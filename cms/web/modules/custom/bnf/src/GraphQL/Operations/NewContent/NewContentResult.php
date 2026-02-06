<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations\NewContent;

class NewContentResult extends \Spawnia\Sailor\Result
{
    public ?NewContent $data = null;

    protected function setData(\stdClass $data): void
    {
        $this->data = NewContent::fromStdClass($data);
    }

    /**
     * Useful for instantiation of successful mocked results.
     *
     * @return static
     */
    public static function fromData(NewContent $data): self
    {
        $instance = new static;
        $instance->data = $data;

        return $instance;
    }

    public function errorFree(): NewContentErrorFreeResult
    {
        return NewContentErrorFreeResult::fromResult($this);
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../sailor.php');
    }
}
