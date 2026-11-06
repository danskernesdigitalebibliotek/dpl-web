# Media: TwentyThree

[TwentyThree](https://www.twentythree.com/) is a video platform. [It supports oEmbed](https://www.twentythree.com/help/manage-oembed)
which is also supported by Drupal Core.

Integration between the two is somewhat tricky.

TwentyThree is not listed on [the official list of oEmbed providers](https://oembed.com/providers.json).
In practice it is not possible to get the platform listed there either. It is a
whitelabel software-as-a-service platform which is exposed on each customer's
own domain, so there is no finite list of url schemes and endpoints for
TwentyThree as a whole.

Instead this module:

1. Adds TwentyThree to the list of supported providers for remote video
2. Defines the url schemes and oEmbed endpoint for each TwentyThree domain used
   by the libraries in `ProviderRepositoryDecorator`. A new domain has to be
   added there.

oEmbed discovery is not used, as Drupal core only performs it for hosts trusted
in the `media_oembed_discovery_trusted_host_patterns` setting.
