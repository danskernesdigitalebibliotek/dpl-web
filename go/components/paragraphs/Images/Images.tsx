import ImageBaseWithPlaceholder from "@/components/shared/image/ImageBaseWithPlaceholder"
import ImageCaptionWrapper from "@/components/shared/image/ImageCaptionWrapper"
import { ParagraphGoImages } from "@/lib/graphql/generated/dpl-cms/graphql"
import { MediaImage } from "@/lib/graphql/generated/dpl-cms/graphql"
import { cn } from "@/lib/helpers/helper.cn"

type TParagraphGoImagesProps = {
  goImages: Array<MediaImage>
} & ParagraphGoImages

export default function Images(props: TParagraphGoImagesProps) {
  const imagesCount = props.goImages.length

  if (imagesCount === 0) {
    return null
  }

  if (imagesCount === 1) {
    const image = props.goImages[0]
    return <ImageSingle image={image} />
  }

  return <ImageMultiple images={props.goImages} />
}

const ImageSingle = ({ image }: { image: MediaImage }) => {
  return (
    <div>
      <div className="content-container">
        <div className="grid-go gap-y-8">
          <div className="grid-go col-span-12 xl:col-span-8 xl:col-start-3">
            <ImageCaptionWrapper caption={image.byline || ""} className="col-span-full">
              <div className="rounded-base relative overflow-hidden">
                {image.mediaImage.url && (
                  <ImageBaseWithPlaceholder
                    src={image.mediaImage.url}
                    alt={image.mediaImage.alt || ""}
                    height={image.mediaImage.height || 0}
                    width={image.mediaImage.width || 0}
                    sizes="100vw"
                    imageSizing="intrinsic"
                  />
                )}
              </div>
            </ImageCaptionWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}

const ImageMultiple = ({ images }: { images: Array<MediaImage> }) => {
  return (
    <div className="content-container">
      <div className="grid-go gap-y-8 py-5 xl:py-10">
        <div className="grid-go col-span-12 xl:col-span-10 xl:col-start-2 xl:grid-cols-10">
          {images.map((image, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "relative col-span-5 h-auto lg:col-span-6 xl:col-span-5",
                  index === 0 ? "-mt-5 xl:-mt-10" : "col-start-2 mt-5 -mb-5 xl:mt-10 xl:-mb-10"
                )}>
                <div>
                  <ImageCaptionWrapper caption={image.byline || ""} className="col-span-full">
                    <div className="rounded-base relative overflow-hidden">
                      {image.mediaImage.url && (
                        <ImageBaseWithPlaceholder
                          src={image.mediaImage.url}
                          alt={image.mediaImage.alt || ""}
                          height={image.mediaImage.height || 0}
                          width={image.mediaImage.width || 0}
                          sizes="100vw"
                          imageSizing="intrinsic"
                        />
                      )}
                    </div>
                  </ImageCaptionWrapper>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
