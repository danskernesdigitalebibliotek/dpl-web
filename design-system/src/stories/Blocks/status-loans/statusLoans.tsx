import {
  ProgressBar,
  ProgressBarProps,
} from "../../Library/progress-bar/progressBar";

export type LinkProps = {
  link: string;
  text: string;
};

export type StatusLoansProps = {
  title: string;
  statusBars: ProgressBarProps[];
  link: LinkProps;
  reservationsText: string;
};

export const StatusLoans = (props: StatusLoansProps) => {
  const { title, statusBars, link, reservationsText } = props;

  return (
    <section className="dpl-status-loans">
      <h2 className="text-header-h4 mt-64 mb-16">{title}</h2>
      <p className="text-body-small-regular dpl-status-loans__reservations">
        {reservationsText}
      </p>
      <a href={link.link} className="link-tag text-body-small-regular">
        {link.text}
      </a>
      <div className="dpl-status-loans__progress-bars">
        {statusBars.map((statusBar) => (
          <ProgressBar key={statusBar.title} {...statusBar} />
        ))}
      </div>
    </section>
  );
};
