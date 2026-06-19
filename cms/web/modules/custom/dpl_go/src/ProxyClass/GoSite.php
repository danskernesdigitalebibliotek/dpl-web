<?php
// phpcs:ignoreFile

/**
 * This file was generated via php core/scripts/generate-proxy-class.php 'Drupal\dpl_go\GoSite' "modules/custom/dpl_go/src".
 */

namespace Drupal\dpl_go\ProxyClass {

    /**
     * Provides a proxy class for \Drupal\dpl_go\GoSite.
     *
     * @see \Drupal\Component\ProxyBuilder
     */
    class GoSite implements \Drupal\dpl_go\GoSiteInterface
    {

        use \Drupal\Core\DependencyInjection\DependencySerializationTrait;

        /**
         * The id of the original proxied service.
         *
         * @var string
         */
        protected $drupalProxyOriginalServiceId;

        /**
         * The real proxied service, after it was lazy loaded.
         *
         * @var \Drupal\dpl_go\GoSite
         */
        protected $service;

        /**
         * The service container.
         *
         * @var \Symfony\Component\DependencyInjection\ContainerInterface
         */
        protected $container;

        /**
         * Constructs a ProxyClass Drupal proxy object.
         *
         * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
         *   The container.
         * @param string $drupal_proxy_original_service_id
         *   The service ID of the original service.
         */
        public function __construct(\Symfony\Component\DependencyInjection\ContainerInterface $container, $drupal_proxy_original_service_id)
        {
            $this->container = $container;
            $this->drupalProxyOriginalServiceId = $drupal_proxy_original_service_id;
        }

        /**
         * Lazy loads the real service from the container.
         *
         * @return object
         *   Returns the constructed real service.
         */
        protected function lazyLoadItself()
        {
            if (!isset($this->service)) {
                $this->service = $this->container->get($this->drupalProxyOriginalServiceId);
            }

            return $this->service;
        }

        /**
         * {@inheritdoc}
         */
        public function isGoSite(): bool
        {
            return $this->lazyLoadItself()->isGoSite();
        }

        /**
         * {@inheritdoc}
         */
        public function useAbsoluteUrls(): bool
        {
            return $this->lazyLoadItself()->useAbsoluteUrls();
        }

        /**
         * {@inheritdoc}
         */
        public function getCmsBaseUrl(): string
        {
            return $this->lazyLoadItself()->getCmsBaseUrl();
        }

        /**
         * {@inheritdoc}
         */
        public function getGoBaseUrl(): string
        {
            return $this->lazyLoadItself()->getGoBaseUrl();
        }

        /**
         * {@inheritdoc}
         */
        public function isGoNode(\Drupal\Core\Entity\EntityInterface $node): bool
        {
            return $this->lazyLoadItself()->isGoNode($node);
        }

        /**
         * {@inheritdoc}
         */
        public function isGoNid(string $nid): ?bool
        {
            return $this->lazyLoadItself()->isGoNid($nid);
        }

    }

}
