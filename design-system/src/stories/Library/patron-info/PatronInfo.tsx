export type PatronInfoProps = {
  name: string;
  nameLabel: string;
};

const PatronInfo = (props: PatronInfoProps) => {
  const { name, nameLabel } = props;

  return (
    <div className="dpl-patron-info">
      <div className="dpl-patron-info__label">{nameLabel}</div>
      <div className="dpl-patron-info__text">{name}</div>
    </div>
  );
};

export default PatronInfo;
