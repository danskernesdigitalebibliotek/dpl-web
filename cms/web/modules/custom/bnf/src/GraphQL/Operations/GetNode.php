<?php declare(strict_types=1);

namespace Drupal\bnf\GraphQL\Operations;

/**
 * @extends \Spawnia\Sailor\Operation<\Drupal\bnf\GraphQL\Operations\GetNode\GetNodeResult>
 */
class GetNode extends \Spawnia\Sailor\Operation
{
    /**
     * @param int|string $id
     */
    public static function execute($id): GetNode\GetNodeResult
    {
        return self::executeOperation(
            $id,
        );
    }

    protected static function converters(): array
    {
        /** @var array<int, array{string, \Spawnia\Sailor\Convert\TypeConverter}>|null $converters */
        static $converters;

        return $converters ??= [
            ['id', new \Spawnia\Sailor\Convert\NonNullConverter(new \Spawnia\Sailor\Convert\IDConverter)],
        ];
    }

    public static function document(): string
    {
        return /* @lang GraphQL */ 'query GetNode($id: ID!) {
          __typename
          info {
            __typename
            name
          }
          node(id: $id) {
            __typename
            ... on NodeInterface {
              id
              title
              url
              status
            }
            ... on NodeArticle {
              canonicalUrl {
                __typename
                url
              }
              changed {
                __typename
                timestamp
                timezone
              }
              created {
                __typename
                timestamp
                timezone
              }
              overrideAuthor
              publicationDate {
                __typename
                timestamp
                timezone
              }
              showOverrideAuthor
              status
              subtitle
              teaserImage {
                __typename
                ... on MediaImage {
                  id
                  name
                  byline
                  mediaImage {
                    __typename
                    alt
                    title
                    url
                  }
                }
              }
              teaserText
              paragraphs {
                __typename
                ... on ParagraphAccordion {
                  id
                  accordionDescription {
                    __typename
                    format
                    value
                  }
                  accordionTitle {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphBanner {
                  id
                  bannerDescription
                  bannerImage {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        title
                        url
                        alt
                      }
                    }
                  }
                  bannerLink {
                    __typename
                    internal
                    title
                    url
                  }
                  underlinedTitle {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphFiles {
                  id
                  files {
                    __typename
                    ... on MediaDocument {
                      id
                      name
                      mediaFile {
                        __typename
                        description
                        name
                        url
                      }
                    }
                  }
                }
                ... on ParagraphHero {
                  id
                  heroContentType
                  heroDate {
                    __typename
                    timestamp
                    timezone
                  }
                  heroDescription {
                    __typename
                    format
                    value
                  }
                  heroImage {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                  heroLink {
                    __typename
                    internal
                    title
                    url
                  }
                  heroTitle
                }
                ... on ParagraphLinks {
                  id
                  link {
                    __typename
                    internal
                    title
                    url
                  }
                }
                ... on ParagraphMaterialGridAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  materialGridDescription
                  materialGridTitle
                  amountOfMaterials
                }
                ... on ParagraphMaterialGridLinkAutomatic {
                  id
                  amountOfMaterials
                  materialGridDescription
                  materialGridLink
                  materialGridTitle
                }
                ... on ParagraphMaterialGridManual {
                  id
                  materialGridDescription
                  materialGridTitle
                  materialGridWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                  workId {
                    __typename
                    material_type
                    work_id
                  }
                }
                ... on ParagraphMedias {
                  id
                  medias {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                }
                ... on ParagraphRecommendation {
                  id
                  imagePositionRight
                  recommendationDescription
                  recommendationTitle {
                    __typename
                    format
                    value
                  }
                  recommendationWorkId {
                    __typename
                    material_type
                    work_id
                  }
                }
                ... on ParagraphSimpleLinks {
                  id
                  link {
                    __typename
                    internal
                    title
                    url
                  }
                }
                ... on ParagraphTextBody {
                  id
                  body {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphVideo {
                  id
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                }
              }
            }
            ... on NodePage {
              displayTitles
              heroTitle
              canonicalUrl {
                __typename
                url
              }
              changed {
                __typename
                timestamp
                timezone
              }
              created {
                __typename
                timestamp
                timezone
              }
              publicationDate {
                __typename
                timestamp
                timezone
              }
              subtitle
              teaserImage {
                __typename
                ... on MediaImage {
                  id
                  name
                  byline
                  mediaImage {
                    __typename
                    alt
                    title
                    url
                  }
                }
              }
              teaserText
              paragraphs {
                __typename
                ... on ParagraphAccordion {
                  id
                  accordionDescription {
                    __typename
                    format
                    value
                  }
                  accordionTitle {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphBanner {
                  id
                  bannerDescription
                  bannerImage {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        title
                        url
                        alt
                      }
                    }
                  }
                  bannerLink {
                    __typename
                    internal
                    title
                    url
                  }
                  underlinedTitle {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphFiles {
                  id
                  files {
                    __typename
                    ... on MediaDocument {
                      id
                      name
                      mediaFile {
                        __typename
                        description
                        name
                        url
                      }
                    }
                  }
                }
                ... on ParagraphHero {
                  id
                  heroContentType
                  heroDate {
                    __typename
                    timestamp
                    timezone
                  }
                  heroDescription {
                    __typename
                    format
                    value
                  }
                  heroImage {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                  heroLink {
                    __typename
                    internal
                    title
                    url
                  }
                  heroTitle
                }
                ... on ParagraphLinks {
                  id
                  link {
                    __typename
                    internal
                    title
                    url
                  }
                }
                ... on ParagraphMaterialGridAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  materialGridDescription
                  materialGridTitle
                  amountOfMaterials
                }
                ... on ParagraphMaterialGridLinkAutomatic {
                  id
                  amountOfMaterials
                  materialGridDescription
                  materialGridLink
                  materialGridTitle
                }
                ... on ParagraphMaterialGridManual {
                  id
                  materialGridDescription
                  materialGridTitle
                  materialGridWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                  workId {
                    __typename
                    material_type
                    work_id
                  }
                }
                ... on ParagraphMedias {
                  id
                  medias {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                }
                ... on ParagraphRecommendation {
                  id
                  imagePositionRight
                  recommendationDescription
                  recommendationTitle {
                    __typename
                    format
                    value
                  }
                  recommendationWorkId {
                    __typename
                    material_type
                    work_id
                  }
                }
                ... on ParagraphSimpleLinks {
                  id
                  link {
                    __typename
                    internal
                    title
                    url
                  }
                }
                ... on ParagraphTextBody {
                  id
                  body {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphVideo {
                  id
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                }
              }
            }
            ... on NodeGoArticle {
              changed {
                __typename
                timestamp
                timezone
              }
              created {
                __typename
                timestamp
                timezone
              }
              overrideAuthor
              publicationDate {
                __typename
                timestamp
                timezone
              }
              showOverrideAuthor
              subtitle
              teaserImageRequired: teaserImage {
                __typename
                ... on MediaImage {
                  id
                  name
                  byline
                  mediaImage {
                    __typename
                    alt
                    title
                    url
                  }
                }
              }
              teaserText
              goArticleImage {
                __typename
                ... on MediaImage {
                  id
                  name
                  byline
                  mediaImage {
                    __typename
                    alt
                    title
                    url
                  }
                }
              }
              paragraphs {
                __typename
                ... on ParagraphGoImages {
                  id
                  goImages {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                }
                ... on ParagraphGoLink {
                  id
                  linkRequired: link {
                    __typename
                    internal
                    title
                    url
                  }
                  targetBlank
                  ariaLabel
                }
                ... on ParagraphGoLinkbox {
                  id
                  title
                  goColor
                  goDescription
                  goImage {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                  goLinkParagraph {
                    __typename
                    ... on ParagraphGoLink {
                      id
                      linkRequired: link {
                        __typename
                        internal
                        title
                        url
                      }
                      targetBlank
                      ariaLabel
                    }
                  }
                }
                ... on ParagraphGoMaterialSliderAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  sliderAmountOfMaterials
                  title
                }
                ... on ParagraphGoMaterialSliderManual {
                  id
                  materialSliderWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                  title
                }
                ... on ParagraphGoTextBody {
                  id
                  body {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphGoVideo {
                  id
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  title
                }
                ... on ParagraphGoVideoBundleAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  goVideoTitle
                  videoAmountOfMaterials
                }
                ... on ParagraphGoVideoBundleManual {
                  id
                  goVideoTitle
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  videoBundleWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                }
              }
            }
            ... on NodeGoCategory {
              changed {
                __typename
                timestamp
                timezone
              }
              created {
                __typename
                timestamp
                timezone
              }
              publicationDate {
                __typename
                timestamp
                timezone
              }
              categoryMenuImage {
                __typename
                ... on MediaImage {
                  id
                  name
                  byline
                  mediaImage {
                    __typename
                    alt
                    title
                    url
                  }
                }
              }
              categoryMenuSound {
                __typename
                ... on MediaAudio {
                  id
                  name
                  mediaAudioFile {
                    __typename
                    description
                    name
                    url
                  }
                }
              }
              categoryMenuTitle
              goColor
              paragraphs {
                __typename
                ... on ParagraphGoImages {
                  id
                  goImages {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                }
                ... on ParagraphGoLink {
                  id
                  linkRequired: link {
                    __typename
                    internal
                    title
                    url
                  }
                  targetBlank
                  ariaLabel
                }
                ... on ParagraphGoLinkbox {
                  id
                  title
                  goColor
                  goDescription
                  goImage {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                  goLinkParagraph {
                    __typename
                    ... on ParagraphGoLink {
                      id
                      linkRequired: link {
                        __typename
                        internal
                        title
                        url
                      }
                      targetBlank
                      ariaLabel
                    }
                  }
                }
                ... on ParagraphGoMaterialSliderAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  sliderAmountOfMaterials
                  title
                }
                ... on ParagraphGoMaterialSliderManual {
                  id
                  materialSliderWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                  title
                }
                ... on ParagraphGoTextBody {
                  id
                  body {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphGoVideo {
                  id
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  title
                }
                ... on ParagraphGoVideoBundleAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  goVideoTitle
                  videoAmountOfMaterials
                }
                ... on ParagraphGoVideoBundleManual {
                  id
                  goVideoTitle
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  videoBundleWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                }
              }
            }
            ... on NodeGoPage {
              changed {
                __typename
                timestamp
                timezone
              }
              created {
                __typename
                timestamp
                timezone
              }
              publicationDate {
                __typename
                timestamp
                timezone
              }
              paragraphs {
                __typename
                ... on ParagraphGoImages {
                  id
                  goImages {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                }
                ... on ParagraphGoLinkbox {
                  id
                  title
                  goColor
                  goDescription
                  goImage {
                    __typename
                    ... on MediaImage {
                      id
                      name
                      byline
                      mediaImage {
                        __typename
                        alt
                        title
                        url
                      }
                    }
                  }
                  goLinkParagraph {
                    __typename
                    ... on ParagraphGoLink {
                      id
                      linkRequired: link {
                        __typename
                        internal
                        title
                        url
                      }
                      targetBlank
                      ariaLabel
                    }
                  }
                }
                ... on ParagraphGoMaterialSliderAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  sliderAmountOfMaterials
                  title
                }
                ... on ParagraphGoMaterialSliderManual {
                  id
                  materialSliderWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                  title
                }
                ... on ParagraphGoTextBody {
                  id
                  body {
                    __typename
                    format
                    value
                  }
                }
                ... on ParagraphGoVideo {
                  id
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  title
                }
                ... on ParagraphGoVideoBundleAutomatic {
                  id
                  cqlSearch {
                    __typename
                    value
                  }
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  goVideoTitle
                  videoAmountOfMaterials
                }
                ... on ParagraphGoVideoBundleManual {
                  id
                  goVideoTitle
                  embedVideo {
                    __typename
                    ... on MediaVideo {
                      id
                      name
                      mediaOembedVideo
                    }
                    ... on MediaVideotool {
                      id
                      name
                      mediaVideotool
                    }
                  }
                  videoBundleWorkIds {
                    __typename
                    material_type
                    work_id
                  }
                }
              }
            }
          }
        }';
    }

    public static function endpoint(): string
    {
        return 'bnf';
    }

    public static function config(): string
    {
        return \Safe\realpath(__DIR__ . '/../../../../../../../sailor.php');
    }
}
