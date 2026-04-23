import "../../Library/Lists/list-reservation/list-reservation.scss";
import clsx from "clsx";
import Cover from "../../Library/cover/Cover";
import { Counter } from "../../Library/counter/Counter";
import { StatusLabel } from "../../Library/status-label/StatusLabel";
import { ReactComponent as ArrowSmallRight } from "../../Library/Arrows/icon-arrow-ui/icon-arrow-ui-small-right.svg";

export interface ReservationListItemProps {
  amount: number;
  withNote?: boolean;
  isStacked?: boolean;
}

const ReservationListItem: React.FC<ReservationListItemProps> = ({
  amount,
  withNote = false,
  isStacked = false,
}) => {
  const listItems = Array(amount).fill(0);
  return (
    <>
      {listItems.map(() => (
        <div
          className={clsx(
            "list-reservation my-32 cursor-pointer arrow__hover--right-small",
            [{ "list-reservation--stacked": isStacked }],
          )}
        >
          <div className="list-reservation__material">
            <div>
              <Cover size="small" tint="120" src="" animate={false} />
            </div>
            <div className="list-reservation__information">
              <div>
                <StatusLabel label="bog" status="outline" />
              </div>
              <div className="list-reservation__about">
                <button
                  type="button"
                  className="list-reservation__header color-secondary-gray"
                >
                  <span
                    id="48991963-title"
                    className="list-reservation__header__text"
                  >
                    Operation Spøgelse
                  </span>
                </button>
                <p
                  data-cy="reservation-about-author"
                  className="text-small-caption color-secondary-gray"
                >
                  Jørn Lier Horst (2020)
                </p>
                {!withNote && (
                  <p
                    data-cy="reservation-about-series"
                    className="text-small-caption color-secondary-gray"
                  >
                    Detektivbureau Nr. 2
                  </p>
                )}
              </div>
              {withNote && (
                <div className="list-reservation__note list-reservation__note--desktop color-signal-alert">
                  You will be charged a fee, when the item is returned
                </div>
              )}
              <div />
            </div>
          </div>
          <div className="list-reservation__status">
            <div className="list-reservation__counter color-secondary-gray">
              {!withNote && (
                <Counter
                  isReady
                  label="Ready"
                  percentage={100}
                  status="info"
                  value={20}
                />
              )}
              {withNote && (
                <Counter
                  label="Days"
                  percentage={100}
                  status="danger"
                  value={0}
                />
              )}
            </div>
            <div>
              <div className="list-reservation__deadline">
                <StatusLabel
                  label="Pick up before xx-xx-xxxx"
                  status={withNote ? "danger" : "info"}
                />
                <p className="text-small-caption">Hovedbiblioteket</p>
                <p className="text-small-caption">Reserveringshylde 74</p>
              </div>
            </div>
            <ArrowSmallRight />
          </div>
        </div>
      ))}
    </>
  );
};

export default ReservationListItem;
