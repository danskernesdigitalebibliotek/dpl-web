<?php

namespace Drupal\media_videotool;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use GuzzleHttp\ClientInterface;
use Psr\Log\LoggerInterface;
use Safe\DateTimeImmutable;
use function Safe\json_decode;
use function Safe\preg_match;

/**
 * Video tool service.
 *
 * Doubles as client for the moment being.
 */
class VideoTool {

  /**
   * Constructs a VideoToolClient.
   */
  public function __construct(
    protected ClientInterface $httpClient,
    protected ConfigFactoryInterface $configFactory,
    protected LoggerInterface $logger,
    protected TimeInterface $dateTime,
  ) {}

  /**
   * Fetches video metadata by VideoTool URL.
   */
  public function getVideoStreamUrl(string $url, int $ttl = 60): ?string {
    $videoName = $this->getVideoName($url);

    if (empty($videoName)) {
      return NULL;
    }

    $config = $this->configFactory->get('media_videotool.settings');
    $publicKey = $config->get('public_key');
    $privateKey = $config->get('private_key');

    if (!$publicKey || !$privateKey) {
      $this->logger->error('VideoTool API credentials are not configured.');
      return NULL;
    }

    // The sendtime parameter needs to be in Danish timezone.
    $sendtime = (new DateTimeImmutable('@' . $this->dateTime->getCurrentTime()))
      ->setTimezone((new \DateTimeZone('Europe/Copenhagen')))
      ->format('YmdHis');

    $method = 'getVideos';
    $encryptedKey = sha1($publicKey . $privateKey . $method . $sendtime);

    $params = [
      'publicKey' => $publicKey,
      'sendtime' => $sendtime,
      'method' => $method,
      'encryptedKey' => $encryptedKey,
      'VideoName' => $videoName,
      'HlsLifeTimeInSeconds' => $ttl,
    ];

    $hlsUrl = NULL;
    try {
      $response = $this->httpClient->request('POST', 'https://api.videotool.dk/api/', [
        'form_params' => $params,
      ]);

      if ($response->getStatusCode() !== 200) {
        return NULL;
      }

      $data = json_decode((string) $response->getBody(), TRUE);

      if (empty($data)) {
        return NULL;
      }

      $hlsUrl = $data['videos'][0]['HlsURL'] ?? NULL;

      return $hlsUrl;
    }
    catch (\Exception $e) {
      $this->logger->error('VideoTool API request failed: @message', ['@message' => $e->getMessage()]);
      return NULL;
    }
  }

  /**
   * Extract VideoName from URL.
   */
  public function getVideoName(string $url): ?string {
    $vn = NULL;

    if (preg_match('/[?&]vn=([^&]+)/', $url, $matches)) {
      $vn = $matches[1];
    }

    return $vn;
  }

}
