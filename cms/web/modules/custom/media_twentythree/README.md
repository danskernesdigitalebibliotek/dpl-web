# Media: TwentyThree

[TwentyThree](https://www.twentythree.com/) is a video platform. [It supports oEmbed](https://www.twentythree.com/help/manage-oembed)
which is also supported by Drupal Core.

Integration between the two is somewhat tricky.

TwentyThree is not listed on [the official list of oEmbed providers](https://www.twentythree.com/)
In practice it is not possible to get the platform listed here either. It is a
whitelabel software-as-a-service platform which can be exposed using custom
domains. This makes it impossible to add a finite list of url schemes and
endpoints supported by TwentyThree.

The [oEmbed Providers Drupal module](https://www.drupal.org/project/oembed_providers)
could be used to allow administrators to define their TwentyThree platform with
its custom domain as an oEmbed Provider.

This has two drawbacks:

1. It is somewhat technical
2. It does not integrate with the Core Media module in adding the new providers
   to the list of supported oEmbed providers for remote video. Instead one has
   to create a new media type for the provider.

Instead this module integrates with TwentyThree in a way which should be easy
for editors to use:

1. It adds TwentyThree to the list of supported providers for remote video
2. Administrators enter the host names of their TwentyThree site at
   `/admin/config/media/twentythree`, after which editors can add videos from
   those hosts.

## How it works

The module decorates the core oEmbed provider repository, adding a
`TwentyThree` provider next to the ones from the official list. For each
configured host, say `video.example.dk`, the provider gets an endpoint at
`https://video.example.dk/oembed` handling URLs matching
`http(s)://video.example.dk/*`. Every TwentyThree site serves its oEmbed
endpoint at `/oembed`, [as documented by TwentyThree](https://www.twentythree.com/help/manage-oembed).

From there core handles TwentyThree like any other oEmbed provider. No oEmbed
discovery is involved, so the `media_oembed_discovery_trusted_host_patterns`
setting does not need to list TwentyThree hosts.

Until a host is added, TwentyThree videos from it are rejected with
"The given URL does not match any known oEmbed providers."
