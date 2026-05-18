import { Button } from "../../Buttons/button/Button";
import { LinkButton } from "../../Buttons/button/LinkButton";
import Cover from "../../cover/Cover";
import { Counter, CounterProps } from "../../counter/Counter";
import { StatusLabel } from "../../status-label/StatusLabel";

export type DigitalLoanCardProps = {
  cover: {
    materialType: string;
    title: string;
    author: string;
    image: string;
  };
  counter: CounterProps;
  deadlineNote: string;
  primaryAction: "reader" | "player";
  primaryActionLabel: string;
};

export const DigitalLoanCard = ({
  cover,
  counter,
  deadlineNote,
  primaryAction,
  primaryActionLabel,
}: DigitalLoanCardProps) => (
  <div className="list-reservation list-reservation--no-hover">
    <div className="list-reservation__material">
      <Cover size="small" animate={false} src={cover.image} />
      <div className="list-reservation__information list-reservation__information--centered-about">
        <StatusLabel label={cover.materialType} status="outline" />
        <div className="list-reservation__about">
          <h3 className="list-reservation__header color-secondary-gray">
            <span className="list-reservation__header__text">
              {cover.title}
            </span>
          </h3>
          <p className="text-small-caption color-secondary-gray">
            {cover.author}
          </p>
        </div>
      </div>
    </div>
    <div className="list-reservation__status">
      <div className="list-reservation__counter">
        <Counter
          label={counter.label}
          percentage={counter.percentage}
          value={counter.value}
          status={counter.status}
          isReady={counter.isReady}
        />
      </div>
      <div className="list-reservation__deadline">
        <p className="text-small-caption color-secondary-gray">
          {deadlineNote}
        </p>
      </div>
      <div className="list-reservation__actions">
        {primaryAction === "reader" ? (
          <LinkButton
            href="#"
            text={primaryActionLabel}
            buttonType="none"
            variant="filled"
            size="small"
          />
        ) : (
          <Button
            label={primaryActionLabel}
            buttonType="none"
            variant="filled"
            size="small"
            collapsible={false}
          />
        )}
        <button type="button" className="link-tag text-small-caption">
          Loan details
        </button>
      </div>
    </div>
  </div>
);
