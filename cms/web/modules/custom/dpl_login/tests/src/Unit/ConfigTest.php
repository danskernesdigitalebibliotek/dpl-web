<?php

namespace Drupal\Tests\dpl_login\Unit;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\Tests\UnitTestCase;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Unit test for the Adgangsplatformen configuration.
 *
 * @covers \Drupal\dpl_login\Adgangsplatformen\Config
 */
class ConfigTest extends UnitTestCase {

  /**
   * A mock basis for an Adgangsplatformen Config object under test.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<ImmutableConfig>
   */
  protected ObjectProphecy $config;

  /**
   * A mock config factory which can return a mock config object.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<ConfigManagerInterface>
   */
  protected ObjectProphecy $configManager;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->config = $config = $this->prophesize(ImmutableConfig::class);
    $this->config->get('settings')->willReturn([
      'agency_id' => '775100',
      'client_id' => 'abcd-1234',
      'client_secret' => 'something_super_secret',
      'token_endpoint' => 'http://auth.tld/token',
      // Even though this config entry is not supported with an accessor it is
      // important for OpenID Connect plugins to work so ensure it is handled
      // correctly.
      'userinfo_endpoint' => 'http://auth.tld/userinfo',
      'logout_endpoint' => 'http://auth.tld/logout',
    ]);

    $configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $configFactory->get(Config::CONFIG_KEY)->will(function () use ($config) {
      // Reveal the configuration on demand.
      return $config->reveal();
    });

    $this->configManager = $this->prophesize(ConfigManagerInterface::class);
    $this->configManager->getConfigFactory()->willReturn($configFactory);
  }

  /**
   * Ensure configuration is returned in a format expected by plugins.
   */
  public function testPluginConfig(): void {
    $config = new Config($this->configManager->reveal());
    $this->assertSame([
      'agency_id' => '775100',
      'client_id' => 'abcd-1234',
      'client_secret' => 'something_super_secret',
      'token_endpoint' => 'http://auth.tld/token',
      'userinfo_endpoint' => 'http://auth.tld/userinfo',
      'logout_endpoint' => 'http://auth.tld/logout',
    ], $config->pluginConfig());
  }

  /**
   * If configuration is missing an empty array must be returned.
   */
  public function testMissingPluginConfig(): void {
    $this->config->get('settings')->willReturn(NULL);
    $config = new Config($this->configManager->reveal());
    $this->assertSame([], $config->pluginConfig());
  }

  /**
   * Accessors must provide typed access to the configuration.
   */
  public function testAccessors(): void {
    $config = new Config($this->configManager->reveal());
    $this->assertEquals('775100', $config->getAgencyId());
    $this->assertEquals('abcd-1234', $config->getClientId());
    $this->assertEquals('something_super_secret', $config->getClientSecret());
    $this->assertEquals('http://auth.tld/token', $config->getTokenEndpoint());
    $this->assertEquals('http://auth.tld/logout', $config->getLogoutEndpoint());
  }

  /**
   * If configuration is missing then accessors will throw an exception.
   */
  public function testAccessorsMissingConfig(): void {
    $this->config->get('settings')->willReturn([]);
    $config = new Config($this->configManager->reveal());
    $this->expectException(MissingConfigurationException::class);
    $config->getAgencyId();
  }

}
