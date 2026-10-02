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
  description: string;
  statusBars: ProgressBarProps[];
  link: LinkProps;
};

export const StatusLoans = (props: StatusLoansProps) => {
  const { title, description, statusBars, link } = props;

  return (
    <section className="dpl-status-loans">
      <h2 className="text-header-h4 mt-64 mb-16">{title}</h2>
      <p className="text-body-small-regular">{description}</p>
      <div className="dpl-status-loans__progress-bars">
        {statusBars.map((statusBar) => (
          <ProgressBar key={statusBar.title} {...statusBar} />
        ))}
      </div>
      <a
        href={link.link}
        className="link-tag text-body-small-regular dpl-status-loans__link"
      >
        {link.text}
      </a>
    </section>
  );
};
