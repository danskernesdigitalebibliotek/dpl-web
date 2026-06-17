<?php

namespace Drupal\Tests\media_videotool\Unit;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\media_videotool\VideoTool;
use Drupal\Tests\UnitTestCase;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Psr7\Response;
use Prophecy\PhpUnit\ProphecyTrait;
use Psr\Log\LoggerInterface;

/**
 * Unit tests for VideoTool.
 *
 * @group media_videotool
 */
class VideoToolTest extends UnitTestCase {

  use ProphecyTrait;

  /**
   * Test URL and string parsing.
   */
  public function testParseUrl(): void {
    $httpClient = $this->prophesize(ClientInterface::class);
    $configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $logger = $this->prophesize(LoggerInterface::class);
    $dateTime = $this->prophesize(TimeInterface::class);

    $client = new VideoTool(
      $httpClient->reveal(),
      $configFactory->reveal(),
      $logger->reveal(),
      $dateTime->reveal(),
    );

    $url = $client->getVideoName('https://media.videotool.dk?vn=557_2023103014511477700668916683');
    $this->assertEquals('557_2023103014511477700668916683', $url);
  }

  /**
   * Test API response parsing and mapping.
   */
  public function testGetStreamUrl(): void {
    $responseBody = json_encode([
      'videos' => [
        [
          'VideoTitle' => 'Test Title',
          'VideoDescription' => 'Test Description',
          'VideoThumbnail' => 'https://img.videotool.dk/thumb.jpg',
          'HlsURL' => 'https://stream.videotool.dk/test.m3u8',
          'VideoName' => '2023103014511477700668916683',
          'ChannelID' => '557',
        ],
      ],
    ]);

    $httpClient = $this->prophesize(ClientInterface::class);

    $expectedPost = [
      'form_params' => [
        'publicKey' => 'test_pub',
        'sendtime' => '20260617093711',
        'method' => 'getVideos',
        'encryptedKey' => 'eacce7b4b5f97029503a83dc16e63966d59be8d4',
        'VideoName' => '557_2023103014511477700668916683',
        'HlsLifeTimeInSeconds' => 64,
      ],
    ];
    $httpClient->request('POST', 'https://api.videotool.dk/api/', $expectedPost)
      ->will(function ($args) use ($responseBody) {
        return new Response(200, [], $responseBody);
      });

    $config = $this->prophesize(Config::class);
    $config->get('public_key')->willReturn('test_pub');
    $config->get('private_key')->willReturn('test_sec');
    $configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $configFactory->get('media_videotool.settings')->willReturn($config);

    $logger = $this->prophesize(LoggerInterface::class);

    $dateTime = $this->prophesize(TimeInterface::class);
    $dateTime->getCurrentTime()->willReturn(1781681831);

    $client = new VideoTool(
      $httpClient->reveal(),
      $configFactory->reveal(),
      $logger->reveal(),
      $dateTime->reveal(),
    );

    $url = $client->getVideoStreamUrl(
      'https://media.videotool.dk?vn=557_2023103014511477700668916683',
      64,
    );

    $this->assertEquals('https://stream.videotool.dk/test.m3u8', $url);
  }

}
