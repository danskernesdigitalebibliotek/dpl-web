import "../Lists/_lists-group.scss";
import React from "react";
import { Button } from "../Buttons/button/Button";
import { ListHeader } from "../list-header/ListHeader";
import { ReactComponent as MenuIcon } from "../../../public/icons/collection/Menu.svg";
import { ReactComponent as VariousIcon } from "../../../public/icons/collection/Various.svg";

export type ListButtonProps = {
  buttonLabel: string;
  header: string;
  number: string;
};

export const ListButton: React.FC<ListButtonProps> = ({
  buttonLabel,
  header,
  number,
}) => {
  return (
    <ListHeader header={header} count={number}>
      <div
        className="dpl-list-buttons__screen-reader-description"
        id="renew-multiple-modal"
      >
        This button opens a modal that covers the entire page and contains loans
        with different due dates, if some of the loans in the modal are
        renewable you can renew them
      </div>
      <div className="dpl-list-buttons">
        <div className="dpl-list-buttons__button">
          <button
            className="dpl-icon-button"
            type="button"
            aria-label="list view"
          >
            <MenuIcon />
          </button>
        </div>
        <div className="dpl-list-buttons__button">
          <button
            className="dpl-icon-button"
            type="button"
            aria-label="stacked view"
          >
            <VariousIcon />
          </button>
        </div>
        <div
          className="dpl-list-buttons__button"
          aria-describedby="renew-multiple-modal"
        >
          <Button
            label={buttonLabel}
            buttonType="none"
            variant="filled"
            disabled={false}
            collapsible={false}
            size="small"
          />
        </div>
      </div>
    </ListHeader>
  );
};
