import { ReactNode } from "react"

const ImageCaptionWrapper = ({
  className,
  children,
  caption,
}: {
  className?: string
  children?: ReactNode
  caption: string
}) => {
  return (
    <div className={className}>
      {children}
      <p className="text-typo-caption text-foreground/80 mt-1">{caption}</p>
    </div>
  )
}

export default ImageCaptionWrapper
