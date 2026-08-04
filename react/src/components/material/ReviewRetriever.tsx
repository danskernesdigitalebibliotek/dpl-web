import React from "react";
import {
  AccessUrl,
  RetrieverService,
  useGetRetrieverQuery
} from "../../core/dbc-gateway/generated/graphql";
import {
  getAuthorNames,
  getPublicationName,
  getReviewRelease
} from "../../core/utils/helpers/general";
import {
  createUrlHash,
  getCurrentLocation,
  HashPrefix,
  isUrlValid,
  redirectToLoginAndBack
} from "../../core/utils/helpers/url";
import { useText } from "../../core/utils/text";
import { ReviewManifestation } from "../../core/utils/types/entities";
import { useUrls } from "../../core/utils/url";
import { useScrollToLocation } from "../../core/utils/UseScrollToLocation";
import { Button } from "../Buttons/Button";
import ReviewHearts from "./ReviewHearts";
import ReviewMetadata from "./ReviewMetadata";

export interface ReviewRetrieverProps {
  review: ReviewManifestation;
  dataCy?: string;
}

const ReviewRetriever: React.FC<ReviewRetrieverProps> = ({
  review: {
    recordCreationDate,
    workYear,
    dateFirstEdition,
    access,
    creators,
    review,
    edition,
    hostPublication
  },
  dataCy = "review-retriever"
}) => {
  const t = useText();
  const u = useUrls();
  const authUrl = u("authUrl");

  const date = getReviewRelease(
    dateFirstEdition,
    workYear,
    edition,
    recordCreationDate
  );
  const authors = getAuthorNames(creators);
  const publication = getPublicationName(hostPublication);
  const retrieverAccess = access.filter(
    (accessItem) => accessItem.__typename === "RetrieverService"
  ) as Pick<RetrieverService, "id">[];
  const retrieverId = retrieverAccess[0].id;
  const { data, error, isLoading } = useGetRetrieverQuery({
    id: retrieverId
  });

  const onClick = (reviewId: string) => {
    const returnUrl = new URL(getCurrentLocation());
    returnUrl.hash = createUrlHash(HashPrefix.REVIEW, reviewId);
    redirectToLoginAndBack({ authUrl, returnUrl });
  };

  useScrollToLocation([data, isLoading]);

  if (error) {
    return null;
  }
  if (!data) {
    return null;
  }
  const { retriever } = data;

  const id = createUrlHash(HashPrefix.REVIEW, retrieverId);

  if (retriever.error) {
    return (
      <li
        className="review text-small-caption"
        id={id}
        data-scroll-target={id}
        data-cy={dataCy}
      >
        {(authors || date || publication) && (
          <ReviewMetadata
            author={authors}
            date={date}
            publication={publication}
          />
        )}
        {review?.rating && <ReviewHearts amountOfHearts={review.rating} />}
        <div className="review__headline mb-8">
          {retriever.error === "BORROWER_NOT_LOGGED_IN" ? (
            <Button
              label={t("loginToSeeReviewText")}
              buttonType="none"
              disabled={false}
              collapsible={false}
              size="xsmall"
              variant="outline"
              onClick={() => {
                onClick(retrieverId);
              }}
            />
          ) : (
            t("cantViewReviewText")
          )}
        </div>
      </li>
    );
  }

  const accessUrls = access.filter(
    (accessItem) => accessItem.__typename === "AccessUrl"
  ) as Pick<AccessUrl, "origin" | "url">[];

  return (
    <li className="review text-small-caption" id={id} data-scroll-target={id}>
      {(authors || date || publication) && (
        <ReviewMetadata
          author={authors}
          date={date}
          publication={publication}
        />
      )}
      {review?.rating && <ReviewHearts amountOfHearts={review.rating} />}
      {retriever.article?.headline && (
        <h3 className="review__headline mb-8">{retriever.article.headline}</h3>
      )}
      {/* We consider Retriever to be a trustworthy source & decided not to
      sanitize the text data that we render as HTML. */}
      {retriever.article?.fullTextHtml && (
        <p
          className="review__body mb-8"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: retriever.article?.fullTextHtml }}
        />
      )}
      {access.some((a) => a.__typename === "AccessUrl") &&
        isUrlValid(accessUrls[0].url) && (
          <ReviewMetadata
            author={authors}
            date={date}
            url={new URL(accessUrls[0].url)}
          />
        )}
    </li>
  );
};

export default ReviewRetriever;
