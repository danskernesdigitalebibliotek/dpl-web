import { clsx } from "clsx";
import Tag from "../tag/Tag";

export enum ContentListItemStatuses {
  NOT_FOR_SALE = "ENDNU IKKE TIL SALG",
  SOLD_OUT = "UDSOLGT",
  CANCELLED = "AFLYST",
  OCCURRED = "AFHOLDT",
}

type ContentListItemStatusProps = {
  status: ContentListItemStatuses;
  size?: "small" | "large";
};

const ContentListItemStatus = ({
  status,
  size = "small",
}: ContentListItemStatusProps) => {
  return (
    <Tag
      hasBackground
      size={size}
      className={clsx(
        "status",
        status === ContentListItemStatuses.NOT_FOR_SALE &&
          "status--not-for-sale",
        status === ContentListItemStatuses.SOLD_OUT && "status--sold-out",
        status === ContentListItemStatuses.CANCELLED && "status--cancelled",
        status === ContentListItemStatuses.OCCURRED && "status--occurred",
      )}
    >
      {status}
    </Tag>
  );
};

export default ContentListItemStatus;
