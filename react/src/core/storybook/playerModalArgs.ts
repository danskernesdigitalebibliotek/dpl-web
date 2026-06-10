export const argTypes = {
  playerModalCloseButtonText: {
    description: "Close",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Close" }
    }
  },
  playerModalDescriptionText: {
    description: "Player modal description text",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Modal for player" }
    }
  }
};

export default {
  playerModalCloseButtonText: "Close",
  playerModalDescriptionText: "Modal for player"
};

export interface PlayerModalProps {
  playerModalCloseButtonText: string;
  playerModalDescriptionText: string;
}
