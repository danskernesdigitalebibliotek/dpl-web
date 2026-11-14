<?php

declare(strict_types=1);

namespace Drupal\Tests\media_twentythree\Unit;

use Drupal\media\OEmbed\Provider;
use Drupal\media\OEmbed\ProviderRepositoryInterface;
use Drupal\media_twentythree\ProviderRepositoryDecorator;
use Drupal\Tests\UnitTestCase;

/**
 * Tests the TwentyThree provider added by the provider repository decorator.
 */
class ProviderRepositoryDecoratorTest extends UnitTestCase {

  /**
   * Build a decorator with the given hosts, decorating a single provider.
   *
   * @param string[] $hosts
   *   The configured hosts.
   */
  protected function decorator(array $hosts): ProviderRepositoryDecorator {
    $youtube = new Provider('YouTube', 'https://www.youtube.com/', [
      [
        'url' => 'https://www.youtube.com/oembed',
        'schemes' => ['https://www.youtube.com/watch*'],
      ],
    ]);

    $inner = $this->createMock(ProviderRepositoryInterface::class);
    $inner->method('getAll')->willReturn(['YouTube' => $youtube]);
    $inner->method('get')->willReturnCallback(
      fn (string $name) => $name === 'YouTube' ? $youtube : throw new \InvalidArgumentException("Unknown provider '$name'"),
    );

    return new ProviderRepositoryDecorator(
      $inner,
      $this->getConfigFactoryStub([
        'media_twentythree.settings' => ['allowed_hosts' => $hosts],
      ]),
    );
  }

  /**
   * Test that the provider has an endpoint for each configured host.
   */
  public function testEndpointPerHost(): void {
    $repository = $this->decorator(['video.example.dk', 'video.example.com']);

    $providers = $repository->getAll();
    $this->assertSame(['YouTube', 'TwentyThree'], array_keys($providers));

    $provider = $repository->get('TwentyThree');
    $endpoints = $provider->getEndpoints();
    $this->assertCount(2, $endpoints);
    $this->assertSame('https://video.example.dk/oembed', $endpoints[0]->getUrl());
    $this->assertSame('https://video.example.com/oembed', $endpoints[1]->getUrl());

    $this->assertTrue($endpoints[0]->matchUrl('https://video.example.dk/video/123/a-video'));
    $this->assertTrue($endpoints[0]->matchUrl('http://video.example.dk/video/123/a-video'));
    $this->assertFalse($endpoints[0]->matchUrl('https://video.example.com/video/123/a-video'));
    $this->assertFalse($endpoints[0]->matchUrl('https://videoxexample.dk/video/123/a-video'));
    $this->assertFalse($endpoints[0]->matchUrl('https://evil.example/https://video.example.dk/'));

    $this->assertSame(
      'https://video.example.dk/oembed?url=https%3A//video.example.dk/video/123/a-video',
      $endpoints[0]->buildResourceUrl('https://video.example.dk/video/123/a-video'),
    );
  }

  /**
   * Test that there is no TwentyThree provider without configured hosts.
   */
  public function testNoHosts(): void {
    $repository = $this->decorator([]);

    $this->assertSame(['YouTube'], array_keys($repository->getAll()));

    $this->expectException(\InvalidArgumentException::class);
    $repository->get($repository::TWENTY_THREE_PROVIDER_NAME);
  }

  /**
   * Test that other providers are passed through.
   */
  public function testOtherProviders(): void {
    $repository = $this->decorator(['video.example.dk']);

    $this->assertSame('YouTube', $repository->get('YouTube')->getName());
  }

}
