import * as React from "react";
import { useDispatch } from "react-redux";
import { ButtonFavouriteId } from "../../components/button-favourite/button-favourite";
import Link from "../../components/atoms/links/Link";
import { Cover } from "../../components/cover/cover";
import { useGetSeriesQuery } from "../../core/dbc-gateway/generated/graphql";
import { guardedRequest } from "../../core/guardedRequests.slice";
import { TypedDispatch } from "../../core/store";
import {
  creatorsToString,
  flattenCreators,
  getCoverTint
} from "../../core/utils/helpers/general";
import {
  constructCreatorSearchUrl,
  constructMaterialUrl
} from "../../core/utils/helpers/url";
import { useText } from "../../core/utils/text";
import { WorkSmall } from "../../core/utils/types/entities";
import { useUrls } from "../../core/utils/url";
import { getSeriesAuthor, sortSeriesMembers } from "./helper";
import SeriesCard from "./SeriesCard";
import SeriesSkeleton, { headerCoverCount } from "./SeriesSkeleton";

export type SeriesProps = {
  seriesId: string;
};

// The generated fragment types the ids as plain strings. Casting to the entity
// types is how the other apps consuming WorkSmall do it - see SearchResult.tsx.
type SeriesMember = {
  numberInSeries?: string | null;
  readThisFirst?: boolean | null;
  work: WorkSmall;
};

const Series: React.FC<SeriesProps> = ({ seriesId }) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const searchUrl = u("searchUrl");
  const dispatch = useDispatch<TypedDispatch>();

  // No isError branch: the QueryClient sets throwOnError, so failed requests
  // are thrown to the ErrorBoundary rather than returned as a flag.
  const { data, isLoading } = useGetSeriesQuery({ seriesId });

  const addToListRequest = (id: ButtonFavouriteId) => {
    dispatch(
      guardedRequest({
        type: "addFavorite",
        args: { id },
        app: "series"
      })
    );
  };

  if (isLoading) {
    return <SeriesSkeleton />;
  }

  // Null while data is undefined, and also when the id matched nothing — the
  // schema returns a nullable Series, so a miss is a success carrying null.
  const series = data?.series;

  if (!series) {
    return null;
  }

  // Around a third of series have no description, and a whitespace-only value
  // would otherwise render an empty paragraph.
  const description = series.description?.trim();
  const members = sortSeriesMembers(series.members as SeriesMember[]);

  const author = getSeriesAuthor(members);
  // Decoration, so a handful is plenty. The design fans out three.
  const coverPids = members
    .slice(0, headerCoverCount)
    .map((member) => member.work.manifestations.bestRepresentation.pid);

  return (
    <div className="series-page">
      <div className="series-page__header">
        <div className="series-page__intro">
          {author && (
            <p className="series-page__byline">
              {t("seriesByAuthorText")}{" "}
              <Link
                className="series-page__byline-link"
                href={constructCreatorSearchUrl(searchUrl, author)}
              >
                {author}
              </Link>
            </p>
          )}

          <h1 className="series-page__title">{series.title}</h1>

          {description && (
            <p className="series-page__description">{description}</p>
          )}
        </div>

        {/*
          Decorative: every one of these covers appears again in the list
          below, so a screen reader announcing them here would only repeat
          itself.
        */}
        {coverPids.length > 0 && (
          <div className="series-page__covers" aria-hidden="true">
            {coverPids.map((pid) => (
              <div className="series-page__cover" key={pid}>
                <Cover ids={[pid]} size="medium" animate={false} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>

      <ul className="series-page__members">
        {members.map((member, index) => {
          const { work } = member;
          const cardAuthor = creatorsToString(
            flattenCreators(work.creators),
            t
          );
          const year = work.workYear?.year;

          return (
            <li className="series-page__member" key={work.workId}>
              <SeriesCard
                workId={work.workId}
                title={work.titles.full.join(", ")}
                url={constructMaterialUrl(materialUrl, work.workId)}
                manifestations={work.manifestations.all}
                coverPid={work.manifestations.bestRepresentation.pid}
                coverTint={getCoverTint(index)}
                authorLine={[
                  cardAuthor && `${t("byAuthorText")} ${cardAuthor}`,
                  year && `(${year})`
                ]
                  .filter(Boolean)
                  .join(" ")}
                numberInSeries={member.numberInSeries}
                readThisFirstLabel={
                  member.readThisFirst
                    ? t("seriesReadThisFirstText")
                    : undefined
                }
                description={work.abstract?.[0]}
                addToListRequest={addToListRequest}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Series;
