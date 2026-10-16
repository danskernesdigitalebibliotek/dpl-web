import { Button } from "../Buttons/button/Button";

export type DigitalSessionMessageProps = {
  text: string;
  buttonLabel: string;
  children?: React.ReactNode;
};

const DigitalSessionMessage: React.FC<DigitalSessionMessageProps> = ({
  text,
  buttonLabel,
  children,
}) => {
  return (
    <section className="digital-session-message">
      <p className="digital-session-message__text">{text}</p>
      {children && (
        <div className="digital-session-message__content">{children}</div>
      )}
      <div className="digital-session-message__footer">
        <Button
          label={buttonLabel}
          buttonType="none"
          size="small"
          variant="filled"
        />
      </div>
    </section>
  );
};

export default DigitalSessionMessage;
