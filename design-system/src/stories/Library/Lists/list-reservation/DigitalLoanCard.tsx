import { Button } from "../../Buttons/button/Button";
import { LinkButton } from "../../Buttons/button/LinkButton";
import Cover from "../../cover/Cover";
import { Counter, CounterProps } from "../../counter/Counter";
import { StatusLabel, StatusLabelProps } from "../../status-label/StatusLabel";

export type DigitalLoanCardProps = {
  material: {
    materialType: string;
    title: string;
    author: string;
    image: string;
  };
  periodical?: string;
  series?: string;
  counter: CounterProps;
  statusBadge?: StatusLabelProps;
  deadlineNote: string;
  primaryAction: "reader" | "player";
  primaryActionLabel: string;
};

export const DigitalLoanCard = ({
  material,
  periodical,
  series,
  counter,
  statusBadge,
  deadlineNote,
  primaryAction,
  primaryActionLabel,
}: DigitalLoanCardProps) => (
  <div className="list-reservation list-reservation--no-hover my-32">
    <div className="list-reservation__material">
      <Cover size="small" animate={false} src={material.image} />
      <div className="list-reservation__information list-reservation__information--centered-about">
        <div>
          <StatusLabel label={material.materialType} status="outline" />
        </div>
        <div className="list-reservation__about">
          <h3 className="list-reservation__title color-secondary-gray">
            <span className="list-reservation__title__text">
              {material.title}
            </span>
          </h3>
          <p className="text-small-caption color-secondary-gray">
            {material.author}
          </p>
          {periodical && (
            <p className="text-small-caption color-secondary-gray">
              {periodical}
            </p>
          )}
          {series && (
            <p className="text-small-caption color-secondary-gray">{series}</p>
          )}
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
        {statusBadge && (
          <StatusLabel label={statusBadge.label} status={statusBadge.status} />
        )}
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
