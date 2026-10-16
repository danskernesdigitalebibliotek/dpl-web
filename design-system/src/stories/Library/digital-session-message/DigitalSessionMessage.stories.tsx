import { Meta, StoryFn } from "@storybook/react-webpack5";
import DigitalSessionMessage from "./DigitalSessionMessage";
import ActionList from "../Lists/action-list/ActionList";
import { Button } from "../Buttons/button/Button";

export default {
  title: "Library / Digital session message",
  component: DigitalSessionMessage,
  argTypes: {
    text: { control: "text" },
    buttonLabel: { control: "text" },
  },
  args: {
    text: "Du har åbnet titlen på en anden enhed. Du kan læse eller lytte på én enhed ad gangen.",
    buttonLabel: "Tilbage",
  },
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof DigitalSessionMessage>;

const Template: StoryFn<typeof DigitalSessionMessage> = (props) => (
  <DigitalSessionMessage {...props} />
);

export const TakenOver = Template.bind({});

export const DeviceRevoked: StoryFn<typeof DigitalSessionMessage> = (props) => (
  <DigitalSessionMessage {...props}>
    <Button label="Åbn igen" buttonType="none" size="small" variant="outline" />
  </DigitalSessionMessage>
);
DeviceRevoked.args = {
  text: "Denne enhed er ikke længere registreret på din konto.",
};

export const DeviceLimitReached: StoryFn<typeof DigitalSessionMessage> = (
  props,
) => (
  <DigitalSessionMessage {...props}>
    <ActionList
      items={[
        {
          title: "Chrome/macOS",
          caption: "Sidst brugt 15-10-2026",
          buttonLabel: "Fjern",
        },
        {
          title: "Safari/iOS",
          caption: "Sidst brugt 15-10-2026",
          buttonLabel: "Fjern",
        },
        {
          title: "Chrome/Windows",
          caption: "Sidst brugt 07-10-2026",
          buttonLabel: "Fjern",
        },
      ]}
    />
  </DigitalSessionMessage>
);
DeviceLimitReached.args = {
  text: "Du kan læse og lytte på op til 3 enheder, og de er alle i brug. Fjern en for at fortsætte her.",
};
