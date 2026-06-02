export const argTypes = {
  onlineMaterialReaderText: {
    description:
      "Label for the primary action that opens the in-browser reader",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Read @materialType" }
    }
  },
  onlineMaterialPlayerText: {
    description: "Label for the primary action that opens the audio player",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: "Listen to @materialType" }
    }
  }
};

export default {
  onlineMaterialReaderText: "Read @materialType",
  onlineMaterialPlayerText: "Listen to @materialType"
};

export interface OnlineMaterialProps {
  onlineMaterialReaderText: string;
  onlineMaterialPlayerText: string;
}
