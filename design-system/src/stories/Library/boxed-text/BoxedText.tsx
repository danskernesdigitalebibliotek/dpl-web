import { FC } from "react";
import clsx from "clsx";

export interface BoxedTextProps {
  text: string;
  classNames?: string;
}

export const BoxedText: FC<BoxedTextProps> = ({ text, classNames }) => {
  return (
    <div className={clsx("boxed-text text-tags noselect", classNames)}>
      {text}
    </div>
  );
};

export default BoxedText;
