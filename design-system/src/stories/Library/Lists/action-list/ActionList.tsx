import { Button } from "../../Buttons/button/Button";

export type ActionListItem = {
  title: string;
  caption?: string;
  buttonLabel: string;
};

export type ActionListProps = {
  items: ActionListItem[];
};

const ActionList: React.FC<ActionListProps> = ({ items }) => {
  return (
    <ul className="action-list">
      {items.map(({ title, caption, buttonLabel }, index) => (
        <li key={index} className="action-list__item">
          <div>
            <h3 className="text-header-h5">{title}</h3>
            {caption && <p className="text-small-caption">{caption}</p>}
          </div>
          <Button
            label={buttonLabel}
            buttonType="none"
            size="small"
            variant="outline"
          />
        </li>
      ))}
    </ul>
  );
};

export default ActionList;
